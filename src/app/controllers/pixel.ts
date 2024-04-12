import { TServiceParams } from "@digital-alchemy/core";
import { GENERIC_SUCCESS_RESPONSE } from "@digital-alchemy/fastify-extension";

import { SetPixelGrid } from "../..";

export function PixelController({
  fastify,
  pi_matrix_app,
  logger,
}: TServiceParams) {
  fastify.routes(server => {
    logger.info(`/pixel`);
    logger.trace(`[POST] {%s}`, "/pixel");

    server.post<{ Body: SetPixelGrid }>("/pixel", async request => {
      logger.debug(`[POST] /pixel`);
      await pi_matrix_app.pixel.setGrid(request.body);
      return GENERIC_SUCCESS_RESPONSE;
    });
  });
}
