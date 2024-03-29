import { TServiceParams } from "@digital-alchemy/core";
import { GENERIC_SUCCESS_RESPONSE } from "@digital-alchemy/fastify-extension";

import {
  AnimationWidgetDTO,
  BorderSpinQueue,
  Colors,
  PulseLaserOptions,
} from "../..";

export function AnimationController({
  lifecycle,
  fastify,
  pi_matrix_app,
}: TServiceParams) {
  lifecycle.onBootstrap(() => {
    const server = fastify.bindings.httpServer;

    // * POST /animation/animate
    server.post<{ Body: AnimationWidgetDTO }>("/animation/animate", request => {
      setImmediate(async () => {
        await pi_matrix_app.sync.runAnimation(request.body);
      });
      return GENERIC_SUCCESS_RESPONSE;
    });

    // * POST /animation/pulse-laser
    server.post<{ Body: PulseLaserOptions }>(
      "/animation/pulse-laser",
      request => {
        return pi_matrix_app.sync.runAnimation({
          animationOptions: request.body,
          type: "animation",
        });
      },
    );

    // * POST /animation/spin-queue
    server.post<{ Body: BorderSpinQueue }>(
      "/animation/spin-queue",
      async request => {
        await this.animation.spinQueue(request.body);
        return GENERIC_SUCCESS_RESPONSE;
      },
    );

    // * GET /animation/test
    server.get("/animation/test", async () => {
      const BLUE = 0x5b_ce_fa;
      const PINK = 0xf5_a9_b8;
      const colors = [BLUE, PINK, Colors.White, PINK, BLUE];
      await this.animation.runAnimation({
        animationOptions: {
          beam: colors.flatMap(color => [color, color, color]),
          brightness: 70,
          row: 1,
          step1Color: Colors.Red,
          type: "pulse-laser",
          y: 10,
        },
        type: "animation",
      });

      return GENERIC_SUCCESS_RESPONSE;
    });
  });
}
