import { TServiceParams } from "@digital-alchemy/core";
import { GENERIC_SUCCESS_RESPONSE } from "@digital-alchemy/fastify-extension";

import { AnimationWidgetDTO, BorderSpinQueue, Colors, PulseLaserOptions } from "../..";

export function AnimationController({ fastify, logger, pi_matrix_app }: TServiceParams) {
  fastify.routes(server => {
    logger.info(`/animation`);

    logger.trace(`[POST] {%s}`, "/animation/animate");
    server.post<{ Body: AnimationWidgetDTO }>("/animation/animate", request => {
      setImmediate(async () => {
        await pi_matrix_app.sync.runAnimation(request.body);
      });
      return GENERIC_SUCCESS_RESPONSE;
    });

    logger.trace(`[POST] {%s}`, "/animation/pulse-laser");
    server.post<{ Body: PulseLaserOptions }>("/animation/pulse-laser", request => {
      return pi_matrix_app.sync.runAnimation({
        animationOptions: request.body,
        type: "animation",
      });
    });

    logger.trace(`[POST] {%s}`, "/animation/spin-queue");
    server.post<{ Body: BorderSpinQueue }>("/animation/spin-queue", async request => {
      await pi_matrix_app.sync.spinQueue(request.body);
      return GENERIC_SUCCESS_RESPONSE;
    });

    logger.trace(`[GET] {%s}`, "/animation/test");
    server.get("/animation/test", async () => {
      const BLUE = 0x5b_ce_fa;
      const PINK = 0xf5_a9_b8;
      const colors = [BLUE, PINK, Colors.White, PINK, BLUE];
      await pi_matrix_app.sync.runAnimation({
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
