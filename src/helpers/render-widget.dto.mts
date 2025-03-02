import { Type } from "@sinclair/typebox";

import { ColorSetter } from "./colors.mts";
import { FONT_LIST } from "./fonts.mts";

export type AnimatedBorderCallback<T extends GenericWidgetDTO = GenericWidgetDTO> = (
  lines: T[],
) => void;

const WidgetTypes = [
  "explode",
  "text",
  "clock",
  "image",
  "gif",
  "animation",
  "countdown",
  "circle",
  "rectangle",
  "line",
] as const;
export type WidgetType =
  | "explode"
  | "text"
  | "clock"
  | "image"
  | "gif"
  | "animation"
  | "countdown"
  | "circle"
  | "rectangle"
  | "line";

export const GenericWidgetDTO = Type.Object({
  id: Type.Optional(Type.String()),
  type: Type.Union(WidgetTypes.map(i => Type.Literal(i))),
});
export type GenericWidgetDTO = typeof GenericWidgetDTO.static;

export const StaticWidgetDTO = Type.Composite([
  GenericWidgetDTO,
  Type.Object({ colorMode: Type.Optional(ColorSetter) }),
]);
export type StaticWidgetDTO = typeof StaticWidgetDTO.static;

export const DashboardWidgetDTO = Type.Composite([
  GenericWidgetDTO,
  Type.Object({
    x: Type.Number(),
    y: Type.Number(),
  }),
]);
export type DashboardWidgetDTO = typeof DashboardWidgetDTO.static;

export const ManualColoring = Type.Composite([
  DashboardWidgetDTO,
  Type.Object({
    brightness: Type.Optional(
      Type.Number({
        maximum: 255,
        minimum: 0,
        multipleOf: 1,
      }),
    ),
    color: Type.Optional(ColorSetter),
  }),
]);
export type ManualColoring = typeof ManualColoring.static;

const BaseText = Type.Composite([
  ManualColoring,
  Type.Object({
    font: Type.Union(FONT_LIST.map(i => Type.Literal(i))),
    horizontal: Type.Optional(Type.Union(["left", "right", "center"].map(i => Type.Literal(i)))),
    kerning: Type.Number(),
    vertical: Type.Optional(Type.Union(["bottom", "middle", "top"].map(i => Type.Literal(i)))),
  }),
]);

export const TextWidgetDTO = Type.Composite([
  BaseText,
  Type.Object({
    text: Type.String(),
  }),
]);
export type TextWidgetDTO = typeof TextWidgetDTO.static;

export const CountdownWidgetDTO = Type.Composite([
  BaseText,
  Type.Object({
    overflow: Type.Optional(
      Type.Boolean({
        description: "true = count up after finishing timer. false = stop at 0",
      }),
    ),
    prefix: Type.Optional(Type.String()),
    suffix: Type.Optional(Type.String()),
    target: Type.String(),
  }),
]);
export type CountdownWidgetDTO = typeof CountdownWidgetDTO.static;

// export class ScrollingTextWidgetDTO extends ManualColoring {
//   background?: ColorSetter;
//   font?: FONTS;
//   height?: number;
//   kerning?: number;
//   speed?: number;
//   text: string;
// }

export const ClockWidgetDTO = Type.Composite([
  BaseText,
  Type.Object({
    format: Type.String(),
  }),
]);
export type ClockWidgetDTO = typeof ClockWidgetDTO.static;

export const ImageWidgetDTO = Type.Composite([
  DashboardWidgetDTO,
  Type.Object({
    height: Type.Optional(Type.Number()),
    path: Type.String(),
    width: Type.Optional(Type.Number()),
  }),
]);
export type ImageWidgetDTO = typeof ImageWidgetDTO.static;

export const GifWidgetDTO = Type.Composite([
  ImageWidgetDTO,
  Type.Object({
    interval: Type.Optional(Type.Number({ description: "ms" })),
  }),
]);
export type GifWidgetDTO = typeof GifWidgetDTO.static;

export const CircleWidgetDTO = Type.Composite([
  ManualColoring,
  Type.Object({
    r: Type.Number(),
    x: Type.Number(),
    y: Type.Number(),
  }),
]);
export type CircleWidgetDTO = typeof CircleWidgetDTO.static;

export const RectangleWidgetDTO = Type.Composite([
  ManualColoring,
  Type.Object({
    fill: Type.Optional(
      Type.Union((["none", "solid", "pulse"] as const).map(i => Type.Literal(i))),
    ),
    height: Type.Number(),
    width: Type.Number(),
  }),
]);
export type RectangleWidgetDTO = typeof RectangleWidgetDTO.static;

export const LineWidgetDTO = Type.Composite([
  ManualColoring,
  Type.Object({
    endX: Type.Number(),
    endY: Type.Number(),
    x: Type.Number(),
    y: Type.Number(),
  }),
]);
export type LineWidgetDTO = typeof LineWidgetDTO.static;
