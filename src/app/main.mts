import { CreateApplication } from "@digital-alchemy/core";
import { LIB_HTTP } from "@digital-alchemy/fastify-extension";

import { LIB_MATRIX_RENDERING } from "../index.mts";
import {
  AnimationController,
  MatrixController,
  PixelController,
  SoundController,
  WidgetController,
} from "./controllers/index.mts";
import {
  BorderSpinQueueExtension,
  Countdown,
  Image,
  MatrixInstance,
  Pixel,
  RenderExtension,
  Sound,
  SyncAnimation,
  Text,
  Widget,
} from "./extensions/index.mts";

const PI_MATRIX = CreateApplication({
  configuration: {},
  libraries: [LIB_HTTP, LIB_MATRIX_RENDERING],
  name: "pi_matrix_app",
  services: {
    AnimationController,
    MatrixController,
    PixelController,
    SoundController,
    WidgetController,
    border_spin: BorderSpinQueueExtension,
    countdown: Countdown,
    image: Image,
    instance: MatrixInstance,
    pixel: Pixel,
    render: RenderExtension,
    sound: Sound,
    sync: SyncAnimation,
    text: Text,
    widget: Widget,
  },
});

declare module "@digital-alchemy/core" {
  export interface LoadedModules {
    pi_matrix_app: typeof PI_MATRIX;
  }
}

setImmediate(async () => await PI_MATRIX.bootstrap());
