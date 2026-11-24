import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import { selectCandidates } from "../candidates.ts";
import { areaCovers, distanceKm } from "../geo.ts";
import { createAccessToken } from "../tokens.ts";
import { MAX_WAVES, WAVE_INTERVAL_MINUTES } from "../rules.ts";
import { offerPush } from "../../notifications/messages.ts";
import { notifyCollector, safely } from "./notify.ts";

/** Offers a pending submission to the next nearest collectors. Safe to call concurrently. */
export async function dispatchWave(ctx: CollectorContext, submissionId: string): Promise<{ offered: number; wave: number | null }> {
  const { store } = ctx;
  const sub = await store.getSubmission(submissionId);
  if (!sub || sub.status !== "pending") return { offered: 0, wave: null };

  // Claiming the wave number first means a second concurrent caller sees a changed count and stops.
  const wave = sub.waveCount + 1;
  const claimedWave = await store.updateSubmissionIf(
    submissionId,
    { status: "pending", waveCount: sub.waveCount },
    { wave_count: wave, last_wave_at: ctx.now.toISOString() },
  );
  if (!claimedWave) return { offered: 0, wave: null };

  const point = { latitude: sub.latitude, longitude: sub.longitude };
  const offered = new Set(await store.listOfferedCollectorIds(submissionId));
  const candidates = selectCandidates(await store.listDispatchable(), point, offered);
  if (!candidates.length) {
    // Nobody left to ask: let the next tick alert the admin instead of waiting out the remaining waves.
    const backdated = new Date(ctx.now.getTime() - WAVE_INTERVAL_MINUTES * 60_000).toISOString();
    await store.updateSubmissionIf(submissionId, { status: "pending", waveCount: wave }, { wave_count: Math.max(wave, MAX_WAVES), last_wave_at: backdated });
    return { offered: 0, wave };
  }
  const offers = candidates.map(collector => ({ collector, ...createAccessToken() }));
  await store.insertOffers(offers.map(o => ({ submissionId, collectorId: o.collector.id, tokenHash: o.hash, wave })));

  for (const { collector, token } of offers) {
    const distance = Math.min(...collector.areas.filter(area => areaCovers(area, point)).map(area => distanceKm(area, point)));
    await safely(() => notifyCollector(ctx, collector.id, "offer", offerPush(sub, distance, `${ctx.appUrl}/j/${token}`)));
  }
  return { offered: offers.length, wave };
}
