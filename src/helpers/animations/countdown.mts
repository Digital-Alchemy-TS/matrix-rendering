import { Type } from "@sinclair/typebox";

import { TextWidgetDTO } from "../render-widget.dto.mts";

export const CountdownOptions = Type.Intersect([
  TextWidgetDTO,
  Type.Object({
    format: Type.Union((["hms", "hmss"] as const).map(i => Type.Literal(i))),
    interval: Type.Optional(Type.Number()),
    target: Type.String(),
    type: Type.Literal("countdown"),
  }),
]);
export type CountdownOptions = typeof CountdownOptions.static;
