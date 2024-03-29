import { TServiceParams } from "@digital-alchemy/core";
import { GENERIC_SUCCESS_RESPONSE } from "@digital-alchemy/fastify-extension";

import { GenericWidgetDTO } from "../..";
import { FONT_LIST } from "../extensions";

export function WidgetController({
  lifecycle,
  fastify,
  pi_matrix_app,
}: TServiceParams) {
  lifecycle.onBootstrap(() => {
    const server = fastify.bindings.httpServer;

    // * GET /widget/
    server.get("/widget/", () => {
      return pi_matrix_app.widget.widgets;
    });

    // * GET /widget/fonts
    server.get("/widget/fonts", () => {
      return FONT_LIST;
    });

    // * POST /widget/
    server.post<{ Body: { dash: GenericWidgetDTO[] } }>("/widget/", request => {
      pi_matrix_app.widget.setWidgets(request.body.dash);
      return GENERIC_SUCCESS_RESPONSE;
    });
  });
}
