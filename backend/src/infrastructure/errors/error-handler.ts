import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-errors";
import { mapPostgresError } from "../../shared/errors/postgres-error-mapper";

export function globalErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    request.log.warn(
      { err: error, statusCode: error.statusCode },
      "Operational Error",
    );

    return reply.status(error.statusCode).send({
      error: error.message,
    });
  }

  // 2. Postgres errors
  const pgError = mapPostgresError(error);
  if (pgError) {
    return reply.status(pgError.statusCode).send({
      error: pgError.message,
      code: error.code,
    });
  }

  // 3. Fastify validation errors (Zod)
  if ((error as any).validation) {
    return reply.status(400).send({
      error: "Invalid request",
      details: (error as any).validation,
    });
  }

  request.log.error({ err: error }, "Unhandled error");

  reply.status(500).send({
    error: "Internal Server Error",
  });
}
