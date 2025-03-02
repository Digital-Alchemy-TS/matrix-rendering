import { TServiceParams } from "@digital-alchemy/core";
import { LedMatrixInstance } from "rpi-led-matrix";

import { SetPixelGrid } from "../../index.mts";
const OFF = { b: 0, g: 0, r: 0 };
export function Pixel({ pi_matrix_app, matrix_rendering }: TServiceParams) {
  /**
   * * `col` / `row` come in as a plain list of x/y coords
   *
   * These need to be translated to numbers that make sense for a chain of panels
   */
  function pixel(col: number, row: number): LedMatrixInstance {
    const [x, y] = matrix_rendering.math.rolloverFix(col, row);
    return pi_matrix_app.instance.instance.setPixel(x, y);
  }

  return {
    render() {
      // TODO: leave note on why this exists
      // aside from making render extension happy
    },
    setGrid({ grid, palette, clear }: SetPixelGrid): void {
      pi_matrix_app.render.renderMode = "pixel";
      if (clear !== false) {
        pi_matrix_app.instance.instance.clear();
      }
      grid.forEach((row, ROW) =>
        row.forEach((color, COL) => pixel(COL, ROW).fgColor(palette[color] ?? OFF)),
      );
      pi_matrix_app.instance.instance.sync();
    },
  };
}
