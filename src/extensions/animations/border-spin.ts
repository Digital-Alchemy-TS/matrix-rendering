/* eslint-disable unicorn/consistent-function-scoping */
import {
  ARRAY_OFFSET,
  NONE,
  SINGLE,
  sleep,
  START,
  TServiceParams,
} from "@digital-alchemy/core";

import {
  AnimatedBorderCallback,
  BorderSpinOptions,
  ColorSetter,
  LineWidgetDTO,
} from "../..";

const DEFAULT_BORDER_INTERVAL = 10;
const DEFAULT_BORDER_BRIGHTNESS = 50;
const BOTH_SIDES = 2;

type LineOptions = {
  brightness: number;
  color: ColorSetter;
  diff: number;
  padding: number;
  time: number;
  totalHeight: number;
  totalWidth: number;
};

export function BorderSpin({ pi_matrix }: TServiceParams) {
  function growBottomRightLeft({
    time,
    padding,
    diff,
    brightness,
    color,
  }: Omit<LineOptions, "totalHeight" | "totalWidth">) {
    const shift = pi_matrix.math.bottom * pi_matrix.math.totalWidth;
    const min = shift + padding - pi_matrix.math.totalWidth;
    const left = shift - padding - Math.ceil(time * diff);
    const out = {
      brightness,
      color,
      // right
      endX: shift - padding - ARRAY_OFFSET,
      endY: pi_matrix.math.panelHeight - SINGLE - padding,
      type: "line",
      // left
      x: left < min ? min : left,
      y: pi_matrix.math.panelHeight - SINGLE - padding,
    } as LineWidgetDTO;
    return out;
  }

  function growLeftBottomUp({
    time,
    padding,
    totalHeight,
    brightness,
    color,
  }: Omit<LineOptions, "diff" | "totalWidth">) {
    return pi_matrix.line
      .bottomToTop(padding, Math.min(time, totalHeight), padding)
      .map(i => ({ ...i, brightness, color, type: "line" }) as LineWidgetDTO);
  }

  function growRightTopDown({
    time,
    padding,
    brightness,
    totalHeight,
    color,
  }: Omit<LineOptions, "diff" | "totalWidth">) {
    return pi_matrix.line
      .topToBottom(
        // ARRAY_OFFSET because grid is 0 indexed, and we need flush
        pi_matrix.math.totalWidth - ARRAY_OFFSET - padding,
        Math.min(time, totalHeight),
        padding,
      )
      .map(i => ({ ...i, brightness, color, type: "line" }) as LineWidgetDTO);
  }

  function growTopLeftRight({
    time,
    padding,
    diff,
    brightness,
    color,
  }: Omit<LineOptions, "totalHeight" | "offset" | "totalWidth">) {
    return {
      brightness,
      color,
      endX: Math.max(padding, Math.ceil(time * diff) + padding - ARRAY_OFFSET),
      endY: padding,
      type: "line",
      x: padding,
      y: padding,
    } as LineWidgetDTO;
  }

  function shrinkBottomRightLeft({
    time,
    padding,
    diff,
    brightness,
    color,
  }: Omit<LineOptions, "offset" | "totalWidth">) {
    const shift = pi_matrix.math.bottom * pi_matrix.math.totalWidth;
    const right = shift - Math.ceil(time * diff) - padding;
    const out = {
      brightness,
      color,
      // right
      endX: right,
      endY: pi_matrix.math.panelHeight - SINGLE - padding,
      type: "line",
      // left
      x: shift - pi_matrix.math.totalWidth + padding,
      y: pi_matrix.math.panelHeight - SINGLE - padding,
    } as LineWidgetDTO;
    return out;
  }

  function shrinkLeftBottomUp({
    time,
    padding,
    totalHeight,
    brightness,
    color,
  }: Omit<LineOptions, "diff" | "offset" | "totalWidth">) {
    return pi_matrix.line
      .topToBottom(padding, totalHeight - time, padding)
      .map(i => ({ ...i, brightness, color, type: "line" }) as LineWidgetDTO);
  }

  function shrinkRightTopDown({
    time,
    padding,
    brightness,
    color,
  }: Omit<LineOptions, "diff" | "offset">) {
    return pi_matrix.line
      .bottomToTop(
        //
        pi_matrix.math.totalWidth - padding - ARRAY_OFFSET,
        pi_matrix.math.bottom * pi_matrix.math.panelHeight - time,
        padding,
      )
      .map(i => ({ ...i, brightness, color, type: "line" }) as LineWidgetDTO);
  }

  function shrinkTopLeftRight({
    time,
    padding,
    diff,
    brightness,
    color,
  }: Omit<LineOptions, "totalHeight" | "offset" | "totalWidth">) {
    return {
      brightness,
      color,
      // left
      endX: Math.floor(time * diff) + padding,
      endY: START + padding,
      type: "line",
      // right
      x:
        pi_matrix.math.totalWidth * (pi_matrix.math.columns - SINGLE) -
        padding -
        ARRAY_OFFSET,
      y: START + padding,
    } as LineWidgetDTO;
  }

  /**
   * Extend a line from the top/left + bottom/right, then retract
   */
  return async function ({
    brightness = DEFAULT_BORDER_BRIGHTNESS,
    callback,
    colorA,
    colorB,
    interval = DEFAULT_BORDER_INTERVAL,
    padding = NONE,
  }: BorderSpinOptions & { callback: AnimatedBorderCallback }) {
    let color = colorA;
    const bothSidesPadding = padding * BOTH_SIDES;
    const totalHeight =
      pi_matrix.math.panelHeight *
        (pi_matrix.math.panelTotal / pi_matrix.math.columns) -
      bothSidesPadding;
    const totalWidth =
      pi_matrix.math.panelWidth * pi_matrix.math.columns - bothSidesPadding;
    const diff = totalWidth / totalHeight;
    // ! Extend
    for (let time = START; time <= totalHeight; time++) {
      callback([
        growTopLeftRight({ brightness, color, diff, padding, time }),
        growBottomRightLeft({
          brightness,
          color,
          diff,
          padding,
          time,
        }),
        ...growLeftBottomUp({
          brightness,
          color,
          padding,
          time,
          totalHeight,
        }),
        ...growRightTopDown({
          brightness,
          color,
          padding,
          time,
          totalHeight,
        }),
      ]);
      await sleep(interval);
    }
    color = colorB ?? colorA;
    // ! Retract
    for (let time = START; time < totalHeight; time++) {
      callback([
        shrinkTopLeftRight({
          brightness,
          color,
          diff,
          padding,
          time,
        }),
        shrinkBottomRightLeft({
          brightness,
          color,
          diff,
          padding,
          time,
          totalHeight,
        }),
        ...shrinkLeftBottomUp({
          brightness,
          color,
          padding,
          time,
          totalHeight,
        }),
        ...shrinkRightTopDown({
          brightness,
          color,
          padding,
          time,
          totalHeight,
          totalWidth,
        }),
      ]);
      await sleep(interval);
    }
    callback([]);
  };
}
