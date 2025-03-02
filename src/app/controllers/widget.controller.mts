import { TServiceParams } from "@digital-alchemy/core";
import { Type } from "@sinclair/typebox";

import { GenericWidgetDTO } from "../../index.mts";
import { FONT_LIST } from "../extensions/index.mts";

export function WidgetController({ http, pi_matrix_app }: TServiceParams) {
  http.controller(["/widget"], fastify => {
    fastify
      .route({
        handler: () => pi_matrix_app.widget.widgets,
        method: "get",
        url: "/",
      })
      .route({
        handler: () => FONT_LIST,
        method: "get",
        url: "/fonts",
      })
      .route({
        handler(request) {
          pi_matrix_app.widget.setWidgets(request.body.dash);
        },
        method: "post",
        schema: {
          body: Type.Object({
            dash: Type.Array(GenericWidgetDTO),
          }),
        },
        url: "/",
      });
  });
}
