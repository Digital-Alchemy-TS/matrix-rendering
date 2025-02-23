import { eachSeries, INCREMENT, sleep, START, TServiceParams } from "@digital-alchemy/core";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { intToRGBA, Jimp } from "jimp";
import { join } from "path";

import { GifWidgetDTO, ImageWidgetDTO, UNLOAD_WIDGETS } from "../../index.mts";

type AnimationExtras = GifWidgetDTO & {
  cachePath?: string;
  frames?: number;
};
const MAX_BRIGHTNESS = 255;
type Cell = [red: number, green: number, blue: number, alpha: number];
export type ImageTransformOptions = {
  height?: number;
  path?: string;
  width?: number;
  x?: number;
  y?: number;
};
const MAX_INTENSITY = 1020;
const IMAGE_CACHE = (widget: ImageWidgetDTO) =>
  [widget.path, widget.height, widget.width].join(`|`);
// eslint-disable-next-line sonarjs/hashing
const hash = (data: string) => createHash("md5").update(data).digest("hex");

// eslint-disable-next-line unicorn/prevent-abbreviations
type jReturn = Awaited<ReturnType<typeof Jimp.read>>;

function getDimensions(
  { bitmap }: jReturn,
  { height, width }: Pick<ImageTransformOptions, "height" | "width">,
): [width: number, height: number] {
  if (width) {
    return [width, bitmap.height * (width / bitmap.width)];
  }
  if (height) {
    return [bitmap.width * (height / bitmap.height), height];
  }
  return [bitmap.width, bitmap.height];
}

function getIntensity(file: jReturn, x: number, y: number) {
  const { r, g, b, a } = intToRGBA(file.getPixelColor(x, y));
  return r + g + b + a;
}

export async function Image({ logger, pi_matrix_app, config, lifecycle, event }: TServiceParams) {
  const execa = (await import("execa")).execa;
  const animationCancel = new Set<() => void>();

  lifecycle.onPostConfig(() => {
    // mkdirSync(cacheDirectory, { recursive: true });
  });
  event.on(UNLOAD_WIDGETS, () => {
    animationCancel.forEach(i => {
      i();
      animationCancel.delete(i);
    });
  });

  /**
   * ! do not await this
   */
  async function manageAnimation({
    interval = config.matrix_rendering.DEFAULT_ANIMATION_INTERVAL,
    frames,
    cachePath,
    ...options
  }: AnimationExtras): Promise<void> {
    let running = true;
    animationCancel.add(() => {
      running = false;
    });
    let current = START;
    while (running) {
      // ? increment to max -> reset -> repeat
      current = current >= frames ? START : current + INCREMENT;
      options.path = join(cachePath, `out-${current}.png`);
      await sleep(interval);
    }
  }

  const image = {
    async loadAnimation(options: GifWidgetDTO): Promise<void> {
      const cachePath = join(config.matrix_rendering.ANIMATION_CACHE_DIRECTORY, hash(options.path));
      if (!existsSync(cachePath)) {
        logger.info(`building frame cache for {${options.path}}`);
        mkdirSync(cachePath);
        // requires imagemagick as outside dependency
        // apt-get install imagemagick
        await execa("convert", [options.path, join(cachePath, "out.png")]);
      }
      const list = readdirSync(cachePath).filter(i => i.startsWith("out") && i.endsWith("png"));
      await eachSeries(list, async path => {
        await image.loadImage(path, options);
      });
      manageAnimation({
        ...options,
        cachePath,
        frames: list.length,
      });
    },
    async loadImage(path: string, options: ImageWidgetDTO): Promise<boolean> {
      const key = IMAGE_CACHE(options);
      if (image.renderCache.has(key)) {
        return true;
      }
      if (!existsSync(path)) {
        logger.warn(`{${path}} does not exist`);
        return false;
      }
      logger.debug(`build {${path}}`);
      const file = await Jimp.read(path);
      const [h, w] = getDimensions(file, options);
      const grid: Cell[][] = [];
      file.resize({ h, w });
      for (let rowIndex = 0; rowIndex < file.bitmap.height; rowIndex++) {
        const row: Cell[] = [];
        grid.push(row);
        for (let colIndex = 0; colIndex < file.bitmap.width; colIndex++) {
          // FIXME: what is going on with this loop?
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          for (let col = 0; col < 2; col++) {
            const intensity = getIntensity(file, colIndex, rowIndex);
            const { r, g, b } = intToRGBA(file.getPixelColor(colIndex, rowIndex));
            const a = Math.floor((intensity / MAX_INTENSITY) * MAX_BRIGHTNESS);
            row.push([r, g, b, a]);
          }
        }
      }
      image.renderCache.set(key, grid);
      return true;
    },

    render(path: string, { x = START, y = START, ...options }: ImageWidgetDTO): void {
      const key = IMAGE_CACHE(options);
      const grid = image.renderCache.get(key);
      if (!grid) {
        logger.error(`{${path}} render before load`);
        return;
      }
      grid.forEach((row, rowIndex) => {
        row.forEach(([r, g, b, a], colIndex) => {
          pi_matrix_app.instance.instance
            .fgColor({ b, g, r })
            .brightness(a)
            .setPixel(colIndex + x, rowIndex + y);
        });
      });
    },

    renderCache: new Map<string, Cell[][]>(),
  };

  return image;
}
