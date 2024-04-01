import { hrtime } from "process";
import { Counter, Gauge, Histogram } from "prom-client";

const SECONDS_TO_MILLISECONDS = 1e3;
const NANOSECONDS_TO_MILLISECONDS = 1e-6;

/**
 * Widget counts the matrix is attempting to render
 */
export const MATRIX_RENDER_WIDGET_COUNT = new Gauge({
  help: "Widget counts the matrix is attempting to render",
  labelNames: ["type"] as const,
  name: "pi_matrix_widget_count",
});

/**
 * Duration of each render call in milliseconds
 */
export const RENDER_DURATION_HISTOGRAM = new Histogram({
  help: "Duration of each render call in milliseconds",
  labelNames: ["type"] as const,
  name: "pi_matrix_render_duration_milliseconds",
});

/**
 * Duration of each render call in milliseconds
 */
export const WIDGET_RENDER_PHASE = new Histogram({
  help: "Duration of each phase of widget rendering in milliseconds",
  labelNames: ["phase"] as const,
  name: "pi_matrix_widget_render_phase",
});

/**
 * Counter for tracking rejected authentication requests.
 */
export const MATRIX_RENDER_IMMEDIATE = new Counter({
  help: "Number renders the renderImmediate flag was used",
  name: "pi_matrix_render_immediate",
});

/**
 * Duration of HTTP requests in milliseconds
 */
export const REQUEST_DURATION_HISTOGRAM = new Histogram({
  help: "Duration of HTTP requests in milliseconds",
  labelNames: ["method", "route"] as const,
  name: "http_request_duration_milliseconds",
});
/**
 * Quantity of errors by route
 */
export const HTTP_REQUEST_ERROR = new Counter({
  help: "Quantity of errors by route",
  labelNames: ["method", "route"] as const,
  name: "http_request_error",
});

export const msOffset = (start: ReturnType<typeof hrtime>) => {
  const [seconds, nano] = hrtime(start);
  return seconds * SECONDS_TO_MILLISECONDS + nano * NANOSECONDS_TO_MILLISECONDS;
};
