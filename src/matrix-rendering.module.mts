import { CreateLibrary, InternalConfig, StringConfig } from "@digital-alchemy/core";
import { homedir } from "os";
import { join } from "path";
import { cwd } from "process";
import { MatrixOptions, RuntimeOptions } from "rpi-led-matrix";

import { FONTS } from "./helpers/fonts.mts";
import { NO_SOUND_DEVICE } from "./index.mts";
import { BorderSpin, Line, MatrixMath, PulseLaser, Text } from "./services/index.mts";

export const LIB_MATRIX_RENDERING = CreateLibrary({
  configuration: {
    ANIMATION_CACHE_DIRECTORY: {
      default: "/tmp/rgb-matrix/animations",
      description: "Storage directory for individual frames for an animation",
      type: "string",
    },
    BORDER_SPIN_LAYER_BOTTLENECK: {
      default: 5,
      description: [
        "Maximum number of border spin layers to run at once, each layer increases render times",
        "Attempting to run more will force queue",
      ].join(". "),
      type: "number",
    },
    DEFAULT_ANIMATION_INTERVAL: {
      default: 100,
      description: "Default time between frames of an image animation (ms)",
      type: "number",
    },
    DEFAULT_FONT: {
      default: "5x8",
      description: "What font should text rendering use if the widget does not provide one?",
      type: "string",
    } as StringConfig<FONTS>,
    DEFAULT_SOUND_DEVICE: {
      default: NO_SOUND_DEVICE,
      description: "Preferred sound device to attempt to play sounds from",
      type: "number",
    },
    FONTS_DIRECTORY: {
      default: join(cwd(), "assets", "fonts"),
      description: "Directory to load .bdf fonts from. A collection comes with the app",
      type: "string",
    },
    MATRIX_OPTIONS: {
      default: {},
      description: "See MatrixOptions in rpi-led-matrix",
      type: "internal",
    } as InternalConfig<MatrixOptions>,
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
    RUNTIME_OPTIONS: {
      default: {},
      description: "See RuntimeOptions in rpi-led-matrix",
      type: "internal",
    } as InternalConfig<RuntimeOptions>,
    SOUND_DIRECTORY: {
      default: join(homedir(), "sound"),
      description: "Directory to load .bdf fonts from",
      type: "string",
    },
    UPDATE_INTERVAL: {
      default: 500,
      description: "Maximum delay between renders in ms",
      type: "number",
    },
  },
  name: "matrix_rendering",
  services: {
    border_spin: BorderSpin,
    line: Line,
    math: MatrixMath,
    pulse_laser: PulseLaser,
    text: Text,
  },
});

declare module "@digital-alchemy/core" {
  export interface LoadedModules {
    matrix_rendering: typeof LIB_MATRIX_RENDERING;
  }
}
