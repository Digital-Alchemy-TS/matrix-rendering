import { Type } from "@sinclair/typebox";

import { GenericWidgetDTO } from "../render-widget.dto.mts";
import { BorderSpinOptions } from "./border-spin.mts";
import { CountdownOptions } from "./countdown.mts";
import { PulseLaserOptions } from "./pulse-laser.mts";

export const AnimationWidgetDTO = Type.Composite([
  GenericWidgetDTO,
  Type.Object({
    animationOptions: Type.Union([BorderSpinOptions, CountdownOptions, PulseLaserOptions]),
    mqttEnd: Type.Optional(Type.String()),
    mqttStart: Type.Optional(Type.String()),
    order: Type.Optional(Type.Union((["pre", "post"] as const).map(i => Type.Literal(i)))),
  }),
]);
export type AnimationWidgetDTO = typeof AnimationWidgetDTO.static;
