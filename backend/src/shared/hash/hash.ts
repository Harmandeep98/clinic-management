import crypto from "crypto";

function hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
