import { TServiceParams } from "@digital-alchemy/core";

export function MatrixController({
  lifecycle,
  fastify,
  logger,
  matrix_rendering,
}: TServiceParams) {
  lifecycle.onBootstrap(() => {
    const server = fastify.bindings.httpServer;
    logger.info(`/matrix`);

    logger.trace(`[GET] {%s}`, "/matrix/dimensions");
    server.get("/matrix/dimensions", () => {
      return {
        height: matrix_rendering.math.totalHeight,
        width: matrix_rendering.math.totalWidth,
      };
    });
  });
}
