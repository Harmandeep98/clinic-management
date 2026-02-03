import jwt from "jsonwebtoken";
import { loadConfig } from "../../config";

export function signJwt<T extends object>(
  payload: T,
  type: "ACCESS" | "REFRESH",
) {
  const jwtConfig = loadConfig().jwt;
  const expiry = type === "ACCESS" ? jwtConfig.expiresIn : jwtConfig.rfExpiry;
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: expiry,
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

export function decodeJwt<T>(token: string): T | null { 
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string') {
    return null;
  }
  return decoded as T;
}
