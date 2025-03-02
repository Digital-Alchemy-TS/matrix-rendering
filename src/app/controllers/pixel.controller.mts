import { TServiceParams } from "@digital-alchemy/core";

import { SetPixelGrid } from "../../index.mts";
import { GENERIC_SUCCESS_RESPONSE } from "../types.mts";

export function PixelController({ http, pi_matrix_app }: TServiceParams) {
  http.controller(["/pixel"], fastify => {
    fastify.route({
      async handler(request) {
        //
        await pi_matrix_app.pixel.setGrid(request.body);
        return GENERIC_SUCCESS_RESPONSE;
      },
      method: "post",
      schema: { body: SetPixelGrid },
      url: "/",
    });
  });
}
