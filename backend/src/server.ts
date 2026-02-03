import Fastify, { FastifyInstance } from "fastify";
import { registerVisitRoutes } from "./http/visits/visit.routes";
import { globalErrorHandler } from "./infrastructure/errors/error-handler";
import { idempotencyMiddleware } from "./http/middlewares/idemopotency/idempotency.middleware";
import { idempotencyOnSendHook } from "./http/hooks/idempotency.hooks";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import fs from "fs";
import path from "path";
import yaml from "yaml";
import { registerUserRoutes } from "./http/users/user.routes";
import { registerAuthRoutes } from "./http/auth/auth.routes";

export function createServer(): FastifyInstance {
  const server = Fastify({
    logger: true,
  });

  const openApiPath = path.join(
    __dirname,
    "../openapi/clinic-api.openapi.yaml",
  );

  const openApiDocument = yaml.parse(fs.readFileSync(openApiPath, "utf8"));

  server.register(swagger, {
    mode: "static",
    specification: {
      document: openApiDocument,
    },
  });

  server.register(swaggerUI, {
    routePrefix: "/docs",
  });

  server.addHook("preHandler", idempotencyMiddleware);

  server.addHook("onSend", idempotencyOnSendHook);

  server.get("/", async () => {
    return { status: "ok" };
  });

  registerAuthRoutes(server);

  registerUserRoutes(server);
  
  registerVisitRoutes(server);


  server.setErrorHandler(globalErrorHandler);

  return server;
}
