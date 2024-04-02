import { DOWN, EMPTY, TServiceParams, UP } from "@digital-alchemy/core";

import { Colors, FONTS, LineWidgetDTO, TextWidgetDTO } from "..";

export type TextLineLayout = Omit<
  TextWidgetDTO,
  "id" | "options" | "type" | "x" | "y" | "font"
> & {
  /**
   * Will try to determine height based on font name if not provided (6x8)
   */
  height?: number;
  priority: number;
  sort: number;
};

type LineInfo = {
  color?: LineConfig;
  line: TextLineLayout;
};

interface RenderOptions {
  brightness: number;
  height?: number;
  lineHeight?: number;
  x: number;
}

interface LineConfig {
  brightness: number;
  color: Colors;
  x: number;
  yEnd: number;
  yStart: number;
}

const DEFAULT_HEIGHT = 6;

export function Text({ matrix_rendering }: TServiceParams) {
  let lines: LineInfo[] = [];

  return {
    addLine(text: TextLineLayout[], color: LineConfig): void {
      lines.push(...text.map(line => ({ color, line })));
    },
    render({
      x,
      lineHeight = EMPTY,
      brightness,
    }: RenderOptions): (TextWidgetDTO | LineWidgetDTO)[] {
      let previous = EMPTY;
      let y = EMPTY;
      return lines
        .sort((a, b) => {
          if (a.line.priority > b.line.priority) {
            return DOWN;
          }
          if (b.line.priority > a.line.priority) {
            return UP;
          }
          return a.line.sort > b.line.sort ? UP : DOWN;
        })
        .flatMap(({ line: { height, ...i }, color }) => {
          const font: FONTS = "6x9";
          height ??= DEFAULT_HEIGHT;
          if (Number.isNaN(height)) {
            return [];
          }
          previous = y;
          y += height + lineHeight;
          if (y > matrix_rendering.math.panelHeight) {
            x += matrix_rendering.math.totalWidth;
            previous = EMPTY;
            y = height + lineHeight;
          }
          const out = [] as (TextWidgetDTO | LineWidgetDTO)[];

          out.push({
            brightness,
            font,
            ...i,
            type: "text",
            x,
            y: previous,
          });
          if (color) {
            const {
              color: lineColor,
              x: lineX,
              yStart,
              yEnd,
              brightness: lineBrightness,
            } = color;
            out.push({
              brightness: lineBrightness,
              color: lineColor,
              endX: x + lineX,
              endY: previous + yStart,
              type: "line",
              x: x + lineX,
              y: previous + yEnd,
            } as LineWidgetDTO);
          }
          return out;
        });
    },
    reset(): void {
      lines = [];
    },
  };
}
