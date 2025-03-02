import { Type } from "@sinclair/typebox";

import { ColorSetter } from "../colors.mts";

export const BorderSpinOptions = Type.Object({
  brightness: Type.Optional(Type.Number()),
  colorA: ColorSetter,
  colorB: Type.Optional(ColorSetter),
  interval: Type.Optional(Type.Number()),
  padding: Type.Optional(Type.Number()),
  type: Type.Literal("border-spin"),
});
export type BorderSpinOptions = typeof BorderSpinOptions.static;

export interface BorderSpinTickOptions {
  stop: () => void;
}

export type BorderSpinCallbackOptions = BorderSpinOptions & BorderSpinTickOptions;

export const BorderSpinQueueItem = Type.Object({
  delayMidpoint: Type.Optional(Type.Number({ default: 0 })),
  delayStart: Type.Optional(Type.Number({ default: 0 })),
  option: BorderSpinOptions,
});
export type BorderSpinQueueItem = typeof BorderSpinQueueItem.static;

export const BorderSpinQueue = Type.Object({
  completeMode: Type.Optional(
    Type.Union(
      (["leave", "collapse"] as const).map(i => Type.Literal(i)),
      { default: "leave" },
    ),
  ),
  spins: Type.Array(BorderSpinQueueItem),

  /**
   * > *Default*: "auto"
   *
   * ### Auto
   *
   * Insert spin at lowest available padding value.
   * Intended to work with "leave" `completeMode`.
   * Will not pick a value that is greater than `BORDER_SPIN_LAYER_BOTTLENECK` (config value)
   *
   * ### Replace
   *
   * Remove existing border spin animations (if present), run this one instead
   *
   * ### Outside
   *
   * Add 1 to the padding of all existing animations (if present), run this animation as the new outside spin
   *
   * ### Inside
   *
   * Set the padding of this border spin to make it the inside most one (if any are already present)
   *
   * ### Queue
   *
   * If any existing border spins are going wait for them to complete before running this one
   */
  type: Type.Optional(
    Type.Union(
      (["auto", "replace", "outside", "inside", "queue"] as const).map(i => Type.Literal(i)),
    ),
  ),
});
export type BorderSpinQueue = typeof BorderSpinQueue.static;
