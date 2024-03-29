import { CreateLibrary } from "@digital-alchemy/core";

import { MatrixMath } from "./extensions";
import { FONTS } from "./helpers/fonts";

export const LIB_PI_MATRIX = CreateLibrary({
  configuration: {
    DEFAULT_FONT: {
      default: "5x8" as FONTS,
      description:
        "What font should text rendering use if the widget does not provide one?",
      type: "string",
    },
    MATRIX_OPTIONS: {
      default: {},
      description: "See MatrixOptions in rpi-led-matrix",
      type: "internal",
    },
    PANEL_COLUMNS: {
      default: 2,
      description: "Quantity of panels side by side in each row",
      type: "number",
    },
    PANEL_HEIGHT: {
      default: 32,
      description: "Pixel count",
      type: "number",
    },
    PANEL_TOTAL: {
      default: 10,
      description: "Total panel quantity in array",
      type: "number",
    },
    PANEL_WIDTH: {
      default: 64,
      description: "Pixel count",
      type: "number",
    },
    PI_MATRIX_BASE_URL: {
      default: "http://localhost:7000",
      type: "string",
    },
    PI_MATRIX_KEY: {
      type: "string",
    },
  },
  name: "pi_matrix",
  services: {
    math: MatrixMath,
  },
});

declare module "@digital-alchemy/core" {
  export interface LoadedModules {
    pi_matrix: typeof LIB_PI_MATRIX;
  }
}
