import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import { selectCandidates } from "../candidates.ts";
import { areaCovers, distanceKm } from "../geo.ts";
import { createAccessToken } from "../tokens.ts";
import { offerPush } from "../../notifications/messages.ts";
import { notifyCollector, safely } from "./notify.ts";

/** Offers a pending submission to the next nearest collectors. Safe to call concurrently. */
export async function dispatchWave(ctx: CollectorContext, submissionId: string): Promise<{ offered: number }> {
  const { store } = ctx;
  const sub = await store.getSubmission(submissionId);
  if (!sub || sub.status !== "pending") return { offered: 0 };

  // Claiming the wave number first means a second concurrent caller sees a changed count and stops.
  const wave = sub.waveCount + 1;
  const claimedWave = await store.updateSubmissionIf(
    submissionId,
    { status: "pending", waveCount: sub.waveCount },
    { wave_count: wave, last_wave_at: ctx.now.toISOString() },
  );
  if (!claimedWave) return { offered: 0 };

  const point = { latitude: sub.latitude, longitude: sub.longitude };
  const offered = new Set(await store.listOfferedCollectorIds(submissionId));
  const candidates = selectCandidates(await store.listDispatchable(), point, offered);
  const offers = candidates.map(collector => ({ collector, ...createAccessToken() }));
  await store.insertOffers(offers.map(o => ({ submissionId, collectorId: o.collector.id, tokenHash: o.hash, wave })));

  for (const { collector, token } of offers) {
    const distance = Math.min(...collector.areas.filter(area => areaCovers(area, point)).map(area => distanceKm(area, point)));
    await safely(() => notifyCollector(ctx, collector.id, "offer", offerPush(sub, distance, `${ctx.appUrl}/j/${token}`)));
  }
  return { offered: offers.length };
}
