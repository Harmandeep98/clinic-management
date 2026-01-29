import { FastifyRequest, FastifyReply } from "fastify";
import { getRedisClient } from "../../infrastructure/redis/client";
import { z } from "zod";

const IDEMPOTENCY_TLL_SECONDS = 600;

const IdempotencyKeySchema = z.string().uuidv7();

export async function idempotencyMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const idempotencyKeyRaw = request.headers["idempotency-key"];

  if (!idempotencyKeyRaw) {
    return;
  }

  const idempotencyKey = IdempotencyKeySchema.parse(idempotencyKeyRaw);

  const redis = getRedisClient();

  const redisKey = `idempotency:${idempotencyKey}`;

  const existing = await redis.get(redisKey);

  if (existing) {
    const parsed = JSON.parse(existing);

    if (parsed.status === "completed") {
      reply.status(parsed.response.statusCode).send(parsed.response.body);
      return reply;
    }

    if (parsed.status === "processing") {
      reply.status(409).send({
        error: "Duplicate request in progress",
      });

      return reply;
    }
  }

  const wasSet = await redis.set(
    redisKey,
    "processing",
    "EX",
    IDEMPOTENCY_TLL_SECONDS,
    "NX",
  );

  if (wasSet !== "OK") {
    reply.status(409).send({
      error: "Duplicate request. This operation is already being processed.",
    });

    throw new Error("IDEMPOTENCY_BLOCKED");
  }

  (request as any).idempotency = { redisKey };
}
