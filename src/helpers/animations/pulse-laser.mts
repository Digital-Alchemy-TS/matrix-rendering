import { Type } from "@sinclair/typebox";

import { ColorSetter } from "../render-widget.dto.mts";

export const PulseLaserOptions = Type.Object({
  beam: Type.Array(ColorSetter),
  brightness: Type.Number(),
  row: Type.Number(),
  step1Color: ColorSetter,
  type: Type.Literal("pulse-laser"),
  y: Type.Number(),
});

export type PulseLaserOptions = typeof PulseLaserOptions.static;
