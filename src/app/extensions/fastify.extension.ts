import { TServiceParams } from "@digital-alchemy/core";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import plugin from "fastify-plugin";
import { hrtime } from "process";

import { REQUEST_DURATION_HISTOGRAM } from "../helpers/metrics";

const LATE_CONFIG = -1;
const SECONDS_TO_MILLISECONDS = 1e3;
const NANOSECONDS_TO_MILLISECONDS = 1e-6;

export function FastifyPlugins({ logger, lifecycle, fastify }: TServiceParams) {
  lifecycle.onPostConfig(() => {
    logger.info({ name: "onPostConfig" }, `attaching matrix fastify plugin`);
    const requests = new Map<FastifyRequest, ReturnType<typeof hrtime>>();

    fastify.bindings.httpServer.register(
      plugin(
        async (server: FastifyInstance) => {
          server.addHook(
            "onRequest",
            (request: FastifyRequest, _: FastifyReply, done) => {
              requests.set(request, hrtime());
              done();
            },
          );

          server.addHook(
            "onResponse",
            (request: FastifyRequest, _: FastifyReply, done) => {
              const start = requests.get(request);
              requests.delete(request);
              const [seconds, nano] = hrtime(start);
              const durationInMilliseconds =
                seconds * SECONDS_TO_MILLISECONDS +
                nano * NANOSECONDS_TO_MILLISECONDS;

              const path = request.routeOptions.url;
              logger.debug(
                { name: request.method },
                `{%s} - %sms`,
                path,
                durationInMilliseconds,
              );
              REQUEST_DURATION_HISTOGRAM.observe(
                { method: request.method, route: path },
                durationInMilliseconds,
              );
              done();
            },
          );
        },
        { name: "measurementPlugin" },
      ),
    );
  }, LATE_CONFIG);
}
