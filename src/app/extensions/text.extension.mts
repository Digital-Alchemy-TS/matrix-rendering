import { NONE, TServiceParams } from "@digital-alchemy/core";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import {
  Font,
  FontInstance,
  HorizontalAlignment,
  LayoutUtils,
  VerticalAlignment,
} from "rpi-led-matrix";

import { Colors, FONTS, TextWidgetDTO } from "../../index.mts";
export let FONT_LIST = [] as FONTS[];
const EXT = "bdf";

export function Text({
  pi_matrix_app,
  config,
  lifecycle,
  logger,
  matrix_rendering,
}: TServiceParams) {
  const fonts = new Map<string, FontInstance>();
  lifecycle.onPostConfig(() => {
    FONT_LIST = readdirSync(config.matrix_rendering.FONTS_DIRECTORY)
      .filter(i => i.endsWith(EXT))
      .map(i => i.replace(`.${EXT}`, "") as FONTS);
  });
  const text = {
    font(font: FONTS): FontInstance {
      text.load(font);
      const requested = fonts.get(font);
      if (requested) {
        return requested;
      }
      logger.error(
        `[%s] font did not load, falling back to default {%s}`,
        font,
        config.matrix_rendering.DEFAULT_FONT,
      );
      return text.font(config.matrix_rendering.DEFAULT_FONT);
    },

    load(name: FONTS): void {
      if (fonts.has(name)) {
        return;
      }
      const file = join(config.matrix_rendering.FONTS_DIRECTORY, `${name}.${EXT}`);
      if (!existsSync(file)) {
        logger.error({ file }, `[%s] cannot find font`, name);
        return;
      }
      fonts.set(name, new Font(name, file));
      logger.debug(`[%s] loaded font`, name);
    },

    preloadAllFonts(): void {
      FONT_LIST.forEach(name => text.load(name));
    },

    render(widget: Partial<TextWidgetDTO>): void {
      const font = fonts.get(widget.font ?? config.matrix_rendering.DEFAULT_FONT);
      const glyphs = LayoutUtils.linesToMappedGlyphs(
        LayoutUtils.textToLines(font, pi_matrix_app.instance.instance.width(), widget.text),
        font.height(),
        pi_matrix_app.instance.instance.width(),
        pi_matrix_app.instance.instance.height(),
        (widget.horizontal ?? "left") as HorizontalAlignment,
        (widget.vertical ?? "top") as VerticalAlignment,
      );
      pi_matrix_app.instance.instance
        .font(font)
        .fgColor((widget.color ?? Colors.White) as number)
        .brightness(matrix_rendering.math.containBrightness(widget.brightness));

      glyphs.forEach(({ x, y, char }) =>
        pi_matrix_app.instance.instance.drawText(
          char,
          x + (widget.x ?? NONE),
          y + (widget.y ?? NONE),
        ),
      );
    },
  };
  return text;
}
