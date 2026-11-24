import { createHash, timingSafeEqual } from "node:crypto";

const digest = (value: string) => createHash("sha256").update(value).digest();

/** True only when the request's x-cron-secret equals a non-empty configured secret. */
export function verifyCronSecret(request: Request, secret: string | undefined): boolean {
  const provided = request.headers.get("x-cron-secret");
  if (!secret || !provided) return false;
  // Hashing first gives equal-length buffers, so the comparison time does not reveal the length.
  return timingSafeEqual(digest(provided), digest(secret));
}
