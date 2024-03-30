import { TServiceParams } from "@digital-alchemy/core";

export function MatrixController({
  lifecycle,
  fastify,
  logger,
  pi_matrix,
}: TServiceParams) {
  lifecycle.onBootstrap(() => {
    const server = fastify.bindings.httpServer;
    logger.info(`/matrix`);

    logger.trace(`[GET] {%s}`, "/matrix/dimensions");
    server.get("/matrix/dimensions", () => {
      return {
        height: pi_matrix.math.totalHeight,
        width: pi_matrix.math.totalWidth,
      };
    });
  });
}
