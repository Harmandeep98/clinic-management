import { FastifyReply, FastifyRequest } from "fastify";
import { getRedisClient } from "../../infrastructure/redis/client";

const IDEMPOTENCY_TTL_SECONDS = 600;

type IdempotencyKeyRecord =
  | {
      status: "processing";
    }
  | {
      status: "completed";
      response: {
        statusCode: number;
        body: unknown;
      };
    };

export async function idempotencyOnSendHook(
  request: FastifyRequest,
  reply: FastifyReply,
  payload: IdempotencyKeyRecord,
) {
  const context = (request as any).idempotency;

  if (!context) return payload;

  const redis = getRedisClient();

  await redis.set(
    context.redisKey,
    JSON.stringify({
      status: "completed",
      response: {
        statusCode: reply.statusCode,
        body: payload,
      },
    }),
    "EX",
    IDEMPOTENCY_TTL_SECONDS,
  );

  return payload;
}
