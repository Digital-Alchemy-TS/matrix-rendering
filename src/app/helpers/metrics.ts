import { Counter, Gauge, Histogram } from "prom-client";

/**
 * Counter for tracking rejected authentication requests.
 */
export const MATRIX_RENDER = new Counter({
  help: "Number of times the .sync method was used",
  labelNames: ["type"] as const,
  name: "pi_matrix_render_sync",
});
/**
 * Counter for tracking rejected authentication requests.
 */
export const MATRIX_RENDER_WIDGET_COUNT = new Gauge({
  help: "Widget counts the matrix is attempting to render",
  labelNames: ["type"] as const,
  name: "pi_matrix_widget_count",
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
