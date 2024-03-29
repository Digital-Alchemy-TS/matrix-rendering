import { ARRAY_OFFSET, NONE, TServiceParams } from "@digital-alchemy/core";

import { LineWidgetDTO } from "..";

type LinePartial = Pick<LineWidgetDTO, "x" | "endX" | "y" | "endY">;

export function Line({ pi_matrix }: TServiceParams) {
  function getHeight(start: number, end: number, localY: number): number {
    const distance = Math.abs(start - end);
    const available = pi_matrix.math.panelHeight - localY;
    return Math.min(available, distance);
  }

  /**
   * Stitch together a vertical line going across multiple panels in a grid
   */
  function multiPanelVerticalLine(
    x: number,
    yTop: number,
    yBottom: number,
  ): LinePartial[] {
    if (yTop > yBottom) {
      return multiPanelVerticalLine(x, yBottom, yTop);
    }
    const out = [];
    while (yTop < yBottom) {
      const start = Math.floor(yTop / pi_matrix.math.panelHeight);
      const localX = start * pi_matrix.math.totalWidth;
      const y = yTop % pi_matrix.math.panelHeight;
      const height = getHeight(yTop, yBottom, y);
      out.push({
        endX: localX + x,
        endY: y + height - ARRAY_OFFSET,
        x: localX + x,
        y,
      });
      yTop += height;
    }
    return out;
  }

  return {
    bottomToTop(left: number, height: number, offset = NONE): LinePartial[] {
      const top = pi_matrix.math.bottom - offset - height;
      const bottom = pi_matrix.math.bottom - offset;
      return multiPanelVerticalLine(left, top, bottom);
    },

    topToBottom(left: number, height: number, offset = NONE): LinePartial[] {
      const top = offset;
      const bottom = offset + height;
      return multiPanelVerticalLine(left, top, bottom);
    },
  };
}
