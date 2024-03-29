import { TServiceParams } from "@digital-alchemy/core";
import { GENERIC_SUCCESS_RESPONSE } from "@digital-alchemy/fastify-extension";

import { SetPixelGrid } from "../..";

export function PixelController({
  lifecycle,
  fastify,
  pi_matrix_app,
}: TServiceParams) {
  lifecycle.onBootstrap(() => {
    const server = fastify.bindings.httpServer;

    // * POST /pixel
    server.post<{ Body: SetPixelGrid }>("/pixel", async request => {
      await pi_matrix_app.pixel.setGrid(request.body);
      return GENERIC_SUCCESS_RESPONSE;
    });
  });
}
