import { TServiceParams } from "@digital-alchemy/core";

export function MatrixController({ http, matrix_rendering }: TServiceParams) {
  http.controller(["/matrix"], fastify => {
    fastify.route({
      handler() {
        return {
          height: matrix_rendering.math.totalHeight,
          width: matrix_rendering.math.totalWidth,
        };
      },
      method: "get",
      url: "/dimensions",
    });
  });
}
