import type { AdminCollectorRow } from "../interfaces/admin-collector-row.interface.ts";
import type { AdminStore } from "../interfaces/admin-store.interface.ts";
import type { CollectorEntryResult } from "../interfaces/collector-entry-result.type.ts";
import { validateAreas } from "../areas.ts";
import { normalizeIndonesianPhone } from "../phone.ts";
import { MAX_WAVES } from "../rules.ts";
import { createAccessToken } from "../tokens.ts";

const NOT_FOUND: CollectorEntryResult = { ok: false, error: "Pengepul tidak ditemukan." };
const BAD_PHONE: CollectorEntryResult = { ok: false, field: "phone", error: "Nomor WhatsApp tidak valid." };
const DUPLICATE_PHONE: CollectorEntryResult = { ok: false, field: "phone", error: "Nomor ini sudah terdaftar." };

const personalLink = (appUrl: string, token: string) => `${appUrl}/p/${token}`;
const cleanName = (value: unknown) => (typeof value === "string" ? value.trim().slice(0, 100) : "");

/** Registers a collector. The raw token appears only in the returned link. */
export async function createCollectorEntry(
  store: AdminStore,
  input: { name?: unknown; phone?: unknown; notifyMode?: unknown; areas?: unknown },
  appUrl: string,
): Promise<CollectorEntryResult> {
  const name = cleanName(input.name);
  if (!name) return { ok: false, field: "name", error: "Isi nama pengepul." };
  const phone = typeof input.phone === "string" ? normalizeIndonesianPhone(input.phone) : null;
  if (!phone) return BAD_PHONE;
  const areas = validateAreas(input.areas);
  if (!areas.ok) return { ok: false, field: "areas", error: areas.error };

  const { token, hash } = createAccessToken();
  const created = await store.createCollector({ name, phone, notifyMode: input.notifyMode === "digest" ? "digest" : "instant", accessTokenHash: hash });
  if ("duplicate" in created) return DUPLICATE_PHONE;
  await store.replaceAreas(created.id, areas.areas);
  return { ok: true, id: created.id, link: personalLink(appUrl, token) };
}

export async function updateCollectorEntry(
  store: AdminStore,
  id: string,
  input: { name?: unknown; phone?: unknown; active?: unknown; notifyMode?: unknown; areas?: unknown; resetLink?: unknown },
  appUrl: string,
): Promise<CollectorEntryResult> {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) {
    const name = cleanName(input.name);
    if (!name) return { ok: false, field: "name", error: "Isi nama pengepul." };
    patch.name = name;
  }
  if (input.phone !== undefined) {
    const phone = typeof input.phone === "string" ? normalizeIndonesianPhone(input.phone) : null;
    if (!phone) return BAD_PHONE;
    patch.phone = phone;
  }
  if (typeof input.active === "boolean") patch.active = input.active;
  if (input.notifyMode === "instant" || input.notifyMode === "digest") patch.notify_mode = input.notifyMode;
  let areas: ReturnType<typeof validateAreas> | null = null;
  if (input.areas !== undefined) {
    areas = validateAreas(input.areas);
    if (!areas.ok) return { ok: false, field: "areas", error: areas.error };
  }
  let link: string | undefined;
  if (input.resetLink === true) {
    const { token, hash } = createAccessToken();
    patch.access_token_hash = hash;
    link = personalLink(appUrl, token);
  }

  const updated = await store.updateCollector(id, patch);
  if (updated === "duplicate") return DUPLICATE_PHONE;
  if (!updated) return NOT_FOUND;
  if (areas?.ok) await store.replaceAreas(id, areas.areas);
  return link ? { ok: true, link } : { ok: true };
}

export async function listCollectorRows(store: AdminStore): Promise<AdminCollectorRow[]> {
  const collectors = await store.listCollectors();
  return Promise.all(collectors.map(async c => {
    const [pushCount, stats] = await Promise.all([store.countPushTargets(c.id), store.collectorStats(c.id)]);
    return {
      id: c.id, name: c.name, phone: c.phone, active: c.active, paused: c.paused, notifyMode: c.notifyMode,
      areas: c.areas, pushEnabled: pushCount > 0, rating: stats.rating, completedJobs: stats.completedJobs,
    };
  }));
}

/** Reports nobody took after every wave, and problems residents raised that are still open. */
export async function listAttention(store: AdminStore) {
  const [unclaimed, problems] = await Promise.all([store.listEscalated(MAX_WAVES + 1), store.listOpenProblems()]);
  return { unclaimed, problems };
}

export async function resolveProblemEntry(store: AdminStore, id: string, now: Date): Promise<boolean> {
  return store.resolveProblem(id, now.toISOString());
}
