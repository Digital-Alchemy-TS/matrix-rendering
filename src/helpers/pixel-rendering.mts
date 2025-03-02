import { Type } from "@sinclair/typebox";

import { RGB } from "./index.mts";

export type SetPixelGrid = typeof SetPixelGrid.static;

export const SetPixelGrid = Type.Object({
  clear: Type.Optional(Type.Boolean({ default: true, description: "Clear the screen first" })),
  debug: Type.Optional(
    Type.String({
      description:
        "Text added to debug logs for auditing / debugging, no other functional purpose planned",
    }),
  ),
  grid: Type.Array(Type.Array(Type.String()), { description: "Grid of palette color references" }),
  palette: Type.Record(Type.String(), RGB, {
    description: "Use single character indexes for palette",
  }),
});
