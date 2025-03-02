import { TServiceParams } from "@digital-alchemy/core";

import { AnimationWidgetDTO, BorderSpinQueue, PulseLaserOptions } from "../../index.mts";
import { GENERIC_SUCCESS_RESPONSE } from "../types.mts";

export function AnimationController({ http, pi_matrix_app }: TServiceParams) {
  http.controller(["/server"], fastify => {
    fastify
      .route({
        handler(request) {
          setImmediate(async () => {
            await pi_matrix_app.sync.runAnimation(request.body);
          });
          return GENERIC_SUCCESS_RESPONSE;
        },
        method: "post",
        schema: { body: AnimationWidgetDTO },
        url: "/animate",
      })
      .route({
        handler(request) {
          return pi_matrix_app.sync.runAnimation({
            animationOptions: request.body,
            type: "animation",
          });
        },
        method: "post",
        schema: { body: PulseLaserOptions },
        url: "/pulse-laser",
      })
      .route({
        async handler(request) {
          await pi_matrix_app.sync.spinQueue(request.body);
          return GENERIC_SUCCESS_RESPONSE;
        },
        method: "post",
        schema: { body: BorderSpinQueue },
        url: "/spin-queue",
      });
  });
}
