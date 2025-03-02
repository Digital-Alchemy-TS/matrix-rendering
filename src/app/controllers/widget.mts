import { TServiceParams } from "@digital-alchemy/core";
import { GENERIC_SUCCESS_RESPONSE } from "@digital-alchemy/fastify-extension";

import { GenericWidgetDTO } from "../../index.mts";
import { FONT_LIST } from "../extensions/index.mts";

export function WidgetController({ fastify, logger, pi_matrix_app, scheduler }: TServiceParams) {
  fastify.routes(server => {
    logger.info(`/widget`);

    logger.trace(`[GET] {%s}`, "/widget");
    server.get("/widget", () => {
      return pi_matrix_app.widget.widgets;
    });

    logger.trace(`[GET] {%s}`, "/widget/fonts");
    server.get("/widget/fonts", () => {
      return FONT_LIST;
    });

    logger.trace(`[POST] {%s}`, "/widget");
    server.post<{ Body: { dash: GenericWidgetDTO[] } }>("/widget", request => {
      pi_matrix_app.widget.setWidgets(request.body.dash);
      return GENERIC_SUCCESS_RESPONSE;
    });
  });
}
