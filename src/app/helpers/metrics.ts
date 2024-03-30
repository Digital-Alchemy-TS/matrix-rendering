import { Counter, Histogram } from "prom-client";

/**
 * Counter for tracking rejected authentication requests.
 */
export const MATRIX_RENDER = new Counter({
  help: "Number of times the .sync method was used",
  name: "pi_matrix_render_sync",
});

/**
 * Counter for tracking rejected authentication requests.
 */
export const MATRIX_RENDER_IMMEDIATE = new Counter({
  help: "Number renders the renderImmediate flag was used",
  name: "pi_matrix_render_immediate",
});

export const REQUEST_DURATION_HISTOGRAM = new Histogram({
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route"] as const,
  name: "http_request_duration_seconds",
});
