import { TServiceParams } from "@digital-alchemy/core";

export function MatrixController({
  lifecycle,
  fastify,
  pi_matrix,
}: TServiceParams) {
  lifecycle.onBootstrap(() => {
    const server = fastify.bindings.httpServer;
    server.get("/matrix/dimensions", () => {
      return {
        height: pi_matrix.math.totalHeight,
        width: pi_matrix.math.totalWidth,
      };
    });
  });
}
