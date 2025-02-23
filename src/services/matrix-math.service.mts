import { ARRAY_OFFSET, NONE, TServiceParams } from "@digital-alchemy/core";

import { MAX_COLOR_BRIGHTNESS, OFF } from "../index.mts";

export function MatrixMath({ logger, config, matrix_rendering, lifecycle }: TServiceParams) {
  lifecycle.onPostConfig(() => {
    logger.debug("updating math from config");

    // transfer values from config
    matrix_rendering.math.columns = config.matrix_rendering.PANEL_COLUMNS;
    matrix_rendering.math.panelHeight = config.matrix_rendering.PANEL_HEIGHT;
    matrix_rendering.math.panelWidth = config.matrix_rendering.PANEL_WIDTH;
    matrix_rendering.math.panelTotal = config.matrix_rendering.PANEL_TOTAL;
    // MATH(S)!
    matrix_rendering.math.bottomLeft =
      (matrix_rendering.math.columns - ARRAY_OFFSET) * matrix_rendering.math.panelHeight;
    matrix_rendering.math.totalWidth =
      matrix_rendering.math.panelWidth * matrix_rendering.math.columns;
    matrix_rendering.math.verticalPanelCount = Math.ceil(
      matrix_rendering.math.panelTotal / matrix_rendering.math.columns,
    );
    matrix_rendering.math.totalHeight =
      matrix_rendering.math.verticalPanelCount * matrix_rendering.math.panelHeight;
    matrix_rendering.math.bottom =
      matrix_rendering.math.totalHeight * matrix_rendering.math.panelHeight;
  });

  return {
    bottom: NONE,
    bottomLeft: NONE,
    columns: NONE,
    containBrightness(brightness: number) {
      return Math.max(Math.min(brightness ?? MAX_COLOR_BRIGHTNESS, MAX_COLOR_BRIGHTNESS), OFF);
    },
    panelHeight: NONE,
    panelTotal: NONE,
    panelWidth: NONE,
    rolloverFix(x: number, y: number): [x: number, y: number, panelShift: number] {
      const panelShift = Math.floor(y / matrix_rendering.math.panelHeight);
      return [
        // ? push horizontally
        x + panelShift * matrix_rendering.math.totalWidth,
        // ? pull vertically
        y % matrix_rendering.math.panelHeight,
        panelShift,
      ];
    },
    totalHeight: NONE,
    totalWidth: NONE,
    verticalPanelCount: NONE,
  };
}
