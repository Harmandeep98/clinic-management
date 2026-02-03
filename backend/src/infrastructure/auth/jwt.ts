import jwt from "jsonwebtoken";
import { loadConfig } from "../../config";
import type { StringValue } from "ms";

export function signJwt<T extends object>(
  payload: T,
  type: "ACCESS" | "REFRESH",
) {
  const jwtConfig = loadConfig().jwt;
  const expiry = type === "ACCESS" ? jwtConfig.expiresIn : jwtConfig.rfExpiry;
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: expiry as StringValue,
    issuer: jwtConfig.verify.allowedIss,
  });
}

export function verifyJwt<T>(token: string): T {
  const jwtConfig = loadConfig().jwt;
  return jwt.verify(token, jwtConfig.secret, {
    issuer: jwtConfig.verify.allowedIss,
    audience: [...jwtConfig.verify.allowedAud],
  }) as T;
}

export function decodeJwt<T>(token: string): (T & { expired: boolean }) | null {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === "string") {
    return null;
  }
  const isExpired = decoded.exp! * 1000 < Date.now();
  return { ...decoded, expired: isExpired } as T & { expired: boolean };
}
