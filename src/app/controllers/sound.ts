import { TServiceParams } from "@digital-alchemy/core";
import { GENERIC_SUCCESS_RESPONSE } from "@digital-alchemy/fastify-extension";

import { PlaySoundCommand } from "../..";

export function SoundController({
  lifecycle,
  fastify,
  pi_matrix_app,
}: TServiceParams) {
  lifecycle.onBootstrap(() => {
    const server = fastify.bindings.httpServer;

    // * POST /sound/play
    server.post<{ Body: PlaySoundCommand }>("/sound/play", async request => {
      await pi_matrix_app.sound.playSound(request.body);
      return GENERIC_SUCCESS_RESPONSE;
    });

    // * GET /sound/configuration
    server.get("/widget/fonts", () => {
      return pi_matrix_app.sound.describeConfiguration();
    });

    // * GET /sound/devices
    server.get("/sound/devices", async () => {
      return await pi_matrix_app.sound.speakerDeviceList();
    });
  });
}
