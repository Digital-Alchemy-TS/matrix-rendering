import { ARRAY_OFFSET, NONE, TServiceParams } from "@digital-alchemy/core";

import { MAX_COLOR_BRIGHTNESS, OFF } from "..";

export function MatrixMath({
  logger,
  config,
  pi_matrix,
  lifecycle,
}: TServiceParams) {
  lifecycle.onPostConfig(() => {
    logger.debug("updating math from config");

    // transfer values from config
    pi_matrix.math.columns = config.pi_matrix.PANEL_COLUMNS;
    pi_matrix.math.panelHeight = config.pi_matrix.PANEL_HEIGHT;
    pi_matrix.math.panelWidth = config.pi_matrix.PANEL_WIDTH;
    pi_matrix.math.panelTotal = config.pi_matrix.PANEL_TOTAL;
    // MATH(S)!
    pi_matrix.math.bottomLeft =
      (pi_matrix.math.columns - ARRAY_OFFSET) * pi_matrix.math.panelHeight;
    pi_matrix.math.totalWidth =
      pi_matrix.math.panelWidth * pi_matrix.math.columns;
    pi_matrix.math.verticalPanelCount = Math.ceil(
      pi_matrix.math.panelTotal / pi_matrix.math.columns,
    );
    pi_matrix.math.totalHeight =
      pi_matrix.math.verticalPanelCount * pi_matrix.math.panelHeight;
    pi_matrix.math.bottom =
      pi_matrix.math.totalHeight * pi_matrix.math.panelHeight;
  });

  return {
    bottom: NONE,
    bottomLeft: NONE,
    columns: NONE,
    containBrightness(brightness: number) {
      return Math.max(
        Math.min(brightness ?? MAX_COLOR_BRIGHTNESS, MAX_COLOR_BRIGHTNESS),
        OFF,
      );
    },
    panelHeight: NONE,
    panelTotal: NONE,
    panelWidth: NONE,
    rolloverFix(
      x: number,
      y: number,
    ): [x: number, y: number, panelShift: number] {
      const panelShift = Math.floor(y / pi_matrix.math.panelHeight);
      return [
        // ? push horizontally
        x + panelShift * pi_matrix.math.totalWidth,
        // ? pull vertically
        y % pi_matrix.math.panelHeight,
        panelShift,
      ];
    },
    totalHeight: NONE,
    totalWidth: NONE,
    verticalPanelCount: NONE,
  };
}
