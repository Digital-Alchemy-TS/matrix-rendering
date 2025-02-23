import { TServiceParams } from "@digital-alchemy/core";
import { GENERIC_SUCCESS_RESPONSE } from "@digital-alchemy/fastify-extension";

import { PlaySoundCommand } from "../../index.mts";

export function SoundController({ fastify, pi_matrix_app }: TServiceParams) {
  fastify.routes(server => {
    // * POST /sound/play
    server.post<{ Body: PlaySoundCommand }>("/sound/play", async request => {
      await pi_matrix_app.sound.playSound(request.body);
      return GENERIC_SUCCESS_RESPONSE;
    });

    // * GET /sound/configuration
    server.get("/sound/configuration", () => {
      return pi_matrix_app.sound.describeConfiguration();
    });

    // * GET /sound/devices
    server.get("/sound/devices", async () => {
      return await pi_matrix_app.sound.speakerDeviceList();
    });
  });
}
