/* eslint-disable @typescript-eslint/no-magic-numbers */

import { HALF } from "@digital-alchemy/core";

export type RGB = Record<"r" | "g" | "b", number>;
type HSV = Record<"h" | "s" | "v", number>;
const clamp = (input: number, min: number, max: number) => {
  if (input < min) {
    return min;
  }
  return input > max ? max : input;
};
export const OFF = 0;
export const MAX_COLOR_BRIGHTNESS = 255;
const HEX_SIZE = 2;
// https://en.wikipedia.org/wiki/Rec._709#Luma_coefficients
const R_LUMINANCE = 0.2126;
const G_LUMINANCE = 0.7152;
const B_LUMINANCE = 0.0722;
export enum Colors {
  Aquamarine = 0x7f_ff_d4,
  Black = 0x00_00_00,
  Blue = 0x00_00_ff,
  Cyan = 0x00_ff_ff,
  Green = 0x00_ff_00,
  Magenta = 0xff_00_ff,
  Purple = 0x80_00_80,
  Orange = 0xff_91_00,
  Red = 0xff_00_00,
  White = 0xff_ff_ff,
  Yellow = 0xff_ff_00,
}

export function hexToRGB(hex = "000000"): RGB {
  const split = hex.match(new RegExp("[0-9A-Fa-f]{1,2}", "g"));
  return {
    b: Number.parseInt(split[2], 16),
    g: Number.parseInt(split[1], 16),
    r: Number.parseInt(split[0], 16),
  };
}

export function isBright(color: string): boolean {
  let { r, g, b } = hexToRGB(color);
  r *= R_LUMINANCE;
  b *= B_LUMINANCE;
  g *= G_LUMINANCE;
  const target = 255 * HALF;
  const total = r + g + b;
  return total > target;
}

/**
 * Reference code: https://gist.github.com/EDais/1ba1be0fe04eca66bbd588a6c9cbd666
 */
export function kelvinToRGB(kelvin: number): RGB {
  kelvin = clamp(kelvin, 1000, 40_000) / 100;
  const r =
    kelvin <= 66 ? 255 : clamp(329.698_727_446 * Math.pow(kelvin - 60, -0.133_204_759_2), 0, 255);
  const g =
    kelvin <= 66
      ? clamp(99.470_802_586_1 * Math.log(kelvin) - 161.119_568_166_1, 0, 255)
      : clamp(288.122_169_528_3 * Math.pow(kelvin - 60, -0.075_514_849_2), 0, 255);
  const b =
    kelvin >= 66
      ? 255
      : kelvin <= 19
        ? 0
        : clamp(138.517_731_223_1 * Math.log(kelvin - 10) - 305.044_792_730_7, 0, 255);
  return { b, g, r };
}

export function rgbToHEX({ r = OFF, b = OFF, g = OFF }: Partial<RGB> = {}): string {
  return (
    r.toString(16).padStart(HEX_SIZE, "0") +
    b.toString(16).padStart(HEX_SIZE, "0") +
    g.toString(16).padStart(HEX_SIZE, "0")
  );
}

/**
 * Reference code: https://gist.github.com/mjackson/5311256#file-color-conversion-algorithms-js-L84
 */
export function rgbToHSV({ r, g, b }: RGB): HSV {
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  const d = max - min;
  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h,
    s: max == 0 ? 0 : d / max,
    v: max,
  };
}
