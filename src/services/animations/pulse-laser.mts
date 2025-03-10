/* eslint-disable unicorn/consistent-function-scoping */
import {
  ARRAY_OFFSET,
  DOWN,
  eachSeries,
  EMPTY,
  HALF,
  INCREMENT,
  INVERT_VALUE,
  is,
  SINGLE,
  sleep,
  START,
  TServiceParams,
  TWO_THIRDS,
  UP,
} from "@digital-alchemy/core";

import {
  AnimatedBorderCallback,
  Colors,
  ColorSetter,
  LineWidgetDTO,
  PulseLaserOptions,
  RectangleWidgetDTO,
} from "../../index.mts";

const INITIAL_FILLIN = 250;
const MIN_FILLIN = 100;
const FILLIN_PACE = 15;
const WAIT_INTERVAL = 10;
const wait = () => sleep(WAIT_INTERVAL);

interface Step1 {
  callback: AnimatedBorderCallback;
  color: ColorSetter;
  size: number;
  x: number;
  yStart: number;
}

interface Step2 {
  brightness: number;
  callback: AnimatedBorderCallback;
  colorBottom: ColorSetter;
  colorTop: ColorSetter;
  x: number;
  yBottom: number;
  yTop: number;
}

type ExecOptions = PulseLaserOptions & { callback: AnimatedBorderCallback };

export function PulseLaser({ matrix_rendering }: TServiceParams) {
  async function step1({ callback, color, x, size, yStart }: Step1): Promise<void> {
    const line: LineWidgetDTO = {
      color,
      endX: x,
      endY: yStart,
      type: "line",
      x,
      y: yStart,
    };
    // eslint-disable-next-line sonarjs/no-dead-store
    let steps = EMPTY;
    if (is.even(size)) {
      line.y = yStart + HALF * size;
      line.endY = line.y + INCREMENT;
      steps = HALF * size - INCREMENT;
    } else {
      line.y = yStart + Math.ceil(HALF * size);
      steps = Math.floor(HALF * size);
      line.endY = line.y;
    }
    callback([line]);
    for (let i = START; i < steps; i++) {
      await wait();
      line.y--;
      line.endY++;
      callback([line]);
    }
  }

  async function step2({
    callback,
    colorBottom,
    colorTop,
    x,
    yBottom,
    yTop,
    brightness,
  }: Step2): Promise<void> {
    const bottom: LineWidgetDTO = {
      brightness: HALF * brightness,
      color: colorBottom,
      endX: x,
      endY: yBottom,
      type: "line",
      x,
      y: yBottom,
    };
    const top: LineWidgetDTO = {
      brightness: HALF * brightness,
      color: colorTop,
      endX: x,
      endY: yTop,
      type: "line",
      x,
      y: yTop,
    };
    callback([top, bottom]);
    for (let i = START; i < matrix_rendering.math.totalWidth - ARRAY_OFFSET; i++) {
      await wait();
      bottom.endX++;
      top.endX++;
      callback([top, bottom]);
    }
  }

  async function step3({ callback, y, beam, row, brightness }: ExecOptions): Promise<void> {
    const x = row * matrix_rendering.math.totalWidth;
    const endX = x + matrix_rendering.math.totalWidth - ARRAY_OFFSET;
    const background = beam.map((_, index) => {
      return {
        brightness: HALF * brightness,
        color: Colors.Black,
        endX: x,
        endY: y + index,
        type: "line",
        x,
        y: y + index,
      } as LineWidgetDTO;
    });

    background[START].endX = endX;
    background[START].color = beam[START];
    background[beam.length - ARRAY_OFFSET].endX = endX;
    background[beam.length - ARRAY_OFFSET].color = beam[beam.length - ARRAY_OFFSET];
    let delay = INITIAL_FILLIN;
    await eachSeries(
      background
        .slice(SINGLE, INVERT_VALUE * SINGLE)
        .map((line, index) => [line, index] as [LineWidgetDTO, number])
        // eslint-disable-next-line sonarjs/pseudo-random
        .toSorted(() => (Math.random() > HALF ? UP : DOWN)),
      async ([line, index]: [LineWidgetDTO, number]) => {
        delay = Math.max(delay - FILLIN_PACE, MIN_FILLIN);
        line.color = beam[index];
        line.endX = endX;
        callback(background);
        await sleep(delay);
      },
    );

    // callback(background);
    // for (let i = START; i <= steps; i++) {
    //   await sleep(HALF * HALF * SECOND);
    //   background[i].color = beam[i];
    //   background[beam.length - ARRAY_OFFSET - i].color = beam[beam.length - ARRAY_OFFSET - i];
    // }

    await wait();
    const foreground = background.map(i => {
      return {
        ...i,
        brightness,
        endX: i.x,
      };
    });
    const merged = [...background, ...foreground] as Array<LineWidgetDTO | RectangleWidgetDTO>;
    callback(merged);
    const movingStart = Math.floor(matrix_rendering.math.totalWidth * TWO_THIRDS);
    const max = x + matrix_rendering.math.totalWidth;
    let added = false;
    const mask = {
      color: Colors.Black,
      fill: "solid",
      height: beam.length,
      type: "rectangle",
      width: EMPTY,
      x,
      y,
    } as RectangleWidgetDTO;
    delay = HALF * WAIT_INTERVAL;

    for (let i = START; i < matrix_rendering.math.totalWidth + movingStart; i++) {
      await sleep(delay);
      foreground.forEach(line => {
        if (line.endX < max - ARRAY_OFFSET) {
          line.endX++;
        }
        if (i > movingStart && line.x < max - ARRAY_OFFSET) {
          line.x++;
        }
      });
      if (i > movingStart) {
        if (!added) {
          added = true;
          delay = Math.floor(HALF * delay);
          merged.push(mask);
        }
        mask.width++;
        background.forEach(line => {
          if (line.x < max) {
            line.x++;
          }
        });
      }
      callback(merged);
    }
  }

  return async function (options: ExecOptions): Promise<void> {
    const { callback, step1Color, y, beam, row, brightness } = options;
    const x = row * matrix_rendering.math.totalWidth;
    // Step 1: left side expand from point vertically
    await step1({
      callback,
      color: step1Color,
      size: beam.length,
      x,
      yStart: y,
    });
    // Step 2: top and bottom expand to right edge
    await step2({
      brightness,
      callback,
      colorBottom: beam[beam.length - ARRAY_OFFSET],
      colorTop: beam[START],
      x,
      yBottom: y + beam.length,
      yTop: y,
    });
    // Step 3: fill in middle
    await step3(options);
    // Step 4: pulse brightness
  };
}
