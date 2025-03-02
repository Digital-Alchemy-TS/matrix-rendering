import { TServiceParams } from "@digital-alchemy/core";

import { PlaySoundCommand } from "../../index.mts";
import { GENERIC_SUCCESS_RESPONSE } from "../types.mts";

export function SoundController({ http, pi_matrix_app }: TServiceParams) {
  http.controller(["/sound"], fastify => {
    fastify
      .route({
        async handler() {
          return await pi_matrix_app.sound.speakerDeviceList();
        },
        method: "get",
        url: "/devices",
      })
      .route({
        handler() {
          return pi_matrix_app.sound.describeConfiguration();
        },
        method: "get",
        url: "/configuration",
      })
      .route({
        async handler(request) {
          await pi_matrix_app.sound.playSound(request.body);
          return GENERIC_SUCCESS_RESPONSE;
        },
        method: "post",
        schema: { body: PlaySoundCommand },
        url: "/play",
      });
  });
}
