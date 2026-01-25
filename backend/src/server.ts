import Fastify, { FastifyInstance } from "fastify";
import { AppError } from "./shared/errors/app-errors";
import { idempotencyMiddleware } from "./http/middlewares/idempotency.middleware";
import { registerVisitRoutes } from "./http/visits/visit.routes";

export function createServer(): FastifyInstance {
  const server = Fastify({
    logger: true,
  });

  server.addHook("preHandler", idempotencyMiddleware);

  server.get("/", async () => {
    return { status: "ok" };
  });

  registerVisitRoutes(server);

  server.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      request.log.warn(
        { err: error, statusCode: error.statusCode },
        "Operational Error",
      );

      reply.status(error.statusCode).send({
        error: error.message,
      });
    }

    request.log.error({ err: error }, "Unhandled error");

    reply.status(500).send({
      error: "Internal Server Error",
    });
  });

  return server;
}
