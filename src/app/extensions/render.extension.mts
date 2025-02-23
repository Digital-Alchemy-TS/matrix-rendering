import { TServiceParams } from "@digital-alchemy/core";

import { MATRIX_RENDER_IMMEDIATE } from "../helpers/metrics.mts";

export const AFTER_SYNC = "after-sync";
export type tAfterSync = (arguments_: { dt: number; t: number }) => boolean | Promise<boolean>;

export function RenderExtension({
  logger,
  config,
  lifecycle,
  scheduler,
  pi_matrix_app,
}: TServiceParams) {
  let isRendering: boolean;
  let renderImmediate: boolean;
  lifecycle.onPostConfig(() => {
    logger.info({ interval: config.matrix_rendering.UPDATE_INTERVAL }, `starting render loop`);
    scheduler.setInterval(
      async () => await render.render(),
       config.matrix_rendering.UPDATE_INTERVAL,
    );
    // ! This method cannot be async
    // ! matrix library will go 100% CPU and break everything
    pi_matrix_app.instance.instance.afterSync((_, dt, t) => {
      render.lastRender = { dt, t };
      isRendering = false;
      if (renderImmediate) {
        renderImmediate = false;
        logger.debug(`render immediate`);
        setImmediate(async () => await render.render());
      }
    });
  });

  const render = {
    /**
     * Description of the last render
     *
     * Mostly useful for debugging
     */
    lastRender: undefined as {
      dt: number;
      t: number;
    },
    /**
     * prevent rendering updates
     */
    paused: false,
    render(): void {
      if (render.paused) {
        logger.debug("paused");
        return;
      }
      if (isRendering) {
        logger.trace("setting [renderImmediate]");
        renderImmediate = true;
        MATRIX_RENDER_IMMEDIATE.inc();
        return;
      }
      if (render.renderMode === "widget") {
        pi_matrix_app.widget.render();
        return;
      }
      pi_matrix_app.pixel.render();
    },
    renderMode: "widget" as "widget" | "pixel",
  };
  return render;
}
