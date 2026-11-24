import "server-only";
import { cookies } from "next/headers";
import { hashToken } from "@/lib/collector/tokens";
import type { Collector } from "@/lib/collector/interfaces/collector.interface";
import type { CollectorContext } from "@/lib/collector/interfaces/collector-context.interface";
import type { JobRef } from "./interfaces/job-ref.type";

export const COLLECTOR_COOKIE = "kasitronik_collector";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function isTokenShape(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}

/** The collector whose personal link set the httpOnly cookie, or null. */
export async function getCurrentCollector(ctx: CollectorContext): Promise<Collector | null> {
  const token = (await cookies()).get(COLLECTOR_COOKIE)?.value ?? "";
  if (!isTokenShape(token)) return null;
  return ctx.store.getCollectorByTokenHash(hashToken(token));
}

/** Resolves a job reference to the acting collector. A notification token carries its own collector. */
export async function resolveJob(ctx: CollectorContext, ref: JobRef): Promise<{ collectorId: string; submissionId: string; offerId?: string } | null> {
  if ("token" in ref) {
    if (!isTokenShape(ref.token)) return null;
    const offer = await ctx.store.getOfferByTokenHash(hashToken(ref.token));
    if (!offer) return null;
    const collector = await ctx.store.getCollector(offer.collectorId);
    if (!collector?.active) return null;
    return { collectorId: offer.collectorId, submissionId: offer.submissionId, offerId: offer.id };
  }
  const collector = await getCurrentCollector(ctx);
  return collector ? { collectorId: collector.id, submissionId: ref.submissionId } : null;
}
