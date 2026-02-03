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
      code: error.code ?? "APPLICATION ERROR",
    });
  }

  // 2. Postgres errors
  const pgError = mapPostgresError(error);
  if (pgError) {
    return reply.status(pgError.statusCode).send({
      error: pgError.message,
      code: "DB ERROR",
    });
  }

  // 3. Zod validation errors
  if (error.name === "ZodError" && Array.isArray((error as any).issues)) {
    const issues = (error as any).issues as Array<{
      path: (string | number)[];
      message: string;
    }>;

    return reply.status(400).send({
      error: issues
        .map((issue, index) => `${index + 1}. ${issue.message}`)
        .join("\n"),
      code: "VALIDATION_ERROR",
    });
  }

  // 4. Fastify validation errors (legacy)
  if ((error as any).validation) {
    return reply.status(400).send({
      error: (error as any).validation,
      code: "INVALID REQUEST",
    });
  }

  request.log.error({ err: error }, "Unhandled error");

  reply.status(500).send({
    error: "Internal Server Error",
    code: "SERVER ERROR",
  });
}
