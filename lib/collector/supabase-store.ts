import type { SupabaseClient } from "@supabase/supabase-js";
import type { CandidateCollector } from "./interfaces/candidate-collector.interface.ts";
import type { Collector } from "./interfaces/collector.interface.ts";
import type { CollectorStore } from "./interfaces/collector-store.interface.ts";
import type { JobOffer } from "./interfaces/job-offer.interface.ts";
import type { NotificationEntry } from "./interfaces/notification-entry.interface.ts";
import type { SubmissionForCollector } from "./interfaces/submission-for-collector.interface.ts";

type Row = Record<string, unknown>;

const COLLECTOR_COLUMNS = "id, name, phone, active, paused, notify_mode, last_digest_at, created_at, collector_areas(center_latitude, center_longitude, radius_km)";

function weightLabel(row: Row): string {
  if (row.weight_kind === "actual") return `sekitar ${row.weight_kg} kg`;
  if (row.weight_kind === "estimate") return `${row.weight_min_kg}-${row.weight_max_kg} kg`;
  return "berat belum diketahui";
}

function toCollector(row: Row): Collector {
  const areas = (row.collector_areas as Row[] | null) ?? [];
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    active: row.active as boolean,
    paused: row.paused as boolean,
    notifyMode: row.notify_mode as Collector["notifyMode"],
    lastDigestAt: (row.last_digest_at as string | null) ?? null,
    createdAt: row.created_at as string,
    areas: areas.map(a => ({ latitude: a.center_latitude as number, longitude: a.center_longitude as number, radiusKm: Number(a.radius_km) })),
  };
}

function toSubmission(row: Row): SubmissionForCollector {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    status: row.status as SubmissionForCollector["status"],
    itemName: row.item_name as string,
    category: row.category as string,
    quantity: row.quantity as number,
    condition: row.condition as string,
    weightLabel: weightLabel(row),
    photoPath: row.photo_path as string,
    latitude: row.pickup_latitude as number,
    longitude: row.pickup_longitude as number,
    address: (row.pickup_address as string | null) ?? "",
    instructions: (row.pickup_instructions as string | null) ?? "",
    district: (row.pickup_district as string | null) ?? "",
    ownerPhone: (row.owner_phone as string | null) ?? null,
    collectorId: (row.collector_id as string | null) ?? null,
    handoverCode: (row.handover_code as string | null) ?? null,
    handoverAttempts: (row.handover_attempts as number | null) ?? 0,
    handoverLockedUntil: (row.handover_locked_until as string | null) ?? null,
    agreedPriceIdr: (row.agreed_price_idr as number | null) ?? null,
    waveCount: (row.wave_count as number | null) ?? 0,
    lastWaveAt: (row.last_wave_at as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

function toOffer(row: Row): JobOffer {
  return {
    id: row.id as string,
    submissionId: row.submission_id as string,
    collectorId: row.collector_id as string,
    wave: row.wave as number,
    status: row.status as JobOffer["status"],
    openedAt: (row.opened_at as string | null) ?? null,
  };
}

function toNotification(row: Row): NotificationEntry {
  return {
    id: row.id as string,
    channel: row.channel as NotificationEntry["channel"],
    kind: row.kind as string,
    recipient: row.recipient as string,
    payload: row.payload,
    status: row.status as NotificationEntry["status"],
    attempts: row.attempts as number,
    lastError: (row.last_error as string | null) ?? null,
  };
}

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export function createSupabaseCollectorStore(db: SupabaseClient): CollectorStore {
  return {
    async getCollectorByTokenHash(hash) {
      const data = check(await db.from("collectors").select(COLLECTOR_COLUMNS).eq("access_token_hash", hash).eq("active", true).maybeSingle());
      return data ? toCollector(data) : null;
    },
    async getCollector(id) {
      const data = check(await db.from("collectors").select(COLLECTOR_COLUMNS).eq("id", id).maybeSingle());
      return data ? toCollector(data) : null;
    },
    async listDispatchable(): Promise<CandidateCollector[]> {
      return (check(await db.from("collectors").select(COLLECTOR_COLUMNS).eq("active", true)) ?? []).map(toCollector);
    },
    async getSubmission(id) {
      const data = check(await db.from("item_submissions").select("*").eq("id", id).maybeSingle());
      return data ? toSubmission(data) : null;
    },
    async listPending() {
      return (check(await db.from("item_submissions").select("*").eq("status", "pending").order("created_at")) ?? []).map(toSubmission);
    },
    async listHeldBy(collectorId) {
      return (check(await db.from("item_submissions").select("*").eq("status", "accepted").eq("collector_id", collectorId).order("claimed_at")) ?? []).map(toSubmission);
    },
    async replaceAreas(collectorId, areas) {
      check(await db.from("collector_areas").delete().eq("collector_id", collectorId));
      if (areas.length) {
        check(await db.from("collector_areas").insert(areas.map(a => ({ collector_id: collectorId, center_latitude: a.latitude, center_longitude: a.longitude, radius_km: a.radiusKm }))));
      }
    },
    async listOfferedCollectorIds(submissionId) {
      return (check(await db.from("job_offers").select("collector_id").eq("submission_id", submissionId)) ?? []).map(r => r.collector_id as string);
    },
    async insertOffers(rows) {
      if (!rows.length) return;
      check(await db.from("job_offers").upsert(
        rows.map(r => ({ submission_id: r.submissionId, collector_id: r.collectorId, token_hash: r.tokenHash, wave: r.wave })),
        { onConflict: "submission_id,collector_id", ignoreDuplicates: true },
      ));
    },
    async getOfferByTokenHash(hash) {
      const data = check(await db.from("job_offers").select("*").eq("token_hash", hash).maybeSingle());
      return data ? toOffer(data) : null;
    },
    async findOffer(submissionId, collectorId) {
      const data = check(await db.from("job_offers").select("*").eq("submission_id", submissionId).eq("collector_id", collectorId).maybeSingle());
      return data ? toOffer(data) : null;
    },
    async markOfferOpened(offerId, at) {
      check(await db.from("job_offers").update({ opened_at: at }).eq("id", offerId).is("opened_at", null));
    },
    async setOffersStatus(submissionId, status, opts = {}) {
      let query = db.from("job_offers").update({ status }).eq("submission_id", submissionId);
      if (opts.onlyCollectorId) query = query.eq("collector_id", opts.onlyCollectorId);
      if (opts.exceptCollectorId) query = query.neq("collector_id", opts.exceptCollectorId);
      if (opts.fromStatus) query = query.eq("status", opts.fromStatus);
      check(await query);
    },
    async updateSubmissionIf(id, expected, patch) {
      let query = db.from("item_submissions").update(patch).eq("id", id);
      if (expected.status !== undefined) query = query.eq("status", expected.status);
      if (expected.collectorId === null) query = query.is("collector_id", null);
      else if (expected.collectorId !== undefined) query = query.eq("collector_id", expected.collectorId);
      if (expected.waveCount !== undefined) query = query.eq("wave_count", expected.waveCount);
      // The conditional UPDATE is atomic in Postgres, so only one concurrent caller can match.
      const data = check(await query.select("id"));
      return (data ?? []).length === 1;
    },
    async updateCollector(id, patch) {
      check(await db.from("collectors").update(patch).eq("id", id));
    },
    async listPushTargets(collectorId) {
      return (check(await db.from("push_subscriptions").select("endpoint, p256dh, auth").eq("collector_id", collectorId)) ?? [])
        .map(r => ({ endpoint: r.endpoint as string, p256dh: r.p256dh as string, auth: r.auth as string }));
    },
    async savePushTarget(collectorId, target) {
      check(await db.from("push_subscriptions").upsert({ collector_id: collectorId, ...target }, { onConflict: "endpoint" }));
    },
    async deletePushTarget(endpoint) {
      check(await db.from("push_subscriptions").delete().eq("endpoint", endpoint));
    },
    async getOwnerEmail(ownerId) {
      const { data, error } = await db.auth.admin.getUserById(ownerId);
      return error ? null : data.user?.email ?? null;
    },
    async getCollectorRating(collectorId) {
      const rows = check(await db.from("item_submissions").select("collector_rating").eq("collector_id", collectorId).not("collector_rating", "is", null)) ?? [];
      if (!rows.length) return null;
      return Math.round((rows.reduce((sum, r) => sum + (r.collector_rating as number), 0) / rows.length) * 10) / 10;
    },
    async logNotification(entry) {
      check(await db.from("notification_log").insert({
        channel: entry.channel, kind: entry.kind, recipient: entry.recipient, payload: entry.payload,
        status: entry.status, attempts: entry.attempts, last_error: entry.lastError,
      }));
    },
    async listRetryableNotifications(maxAttempts) {
      return (check(await db.from("notification_log").select("*").eq("status", "failed").lt("attempts", maxAttempts).limit(50)) ?? []).map(toNotification);
    },
    async updateNotification(id, patch) {
      const row: Row = {};
      if (patch.status) row.status = patch.status;
      if (patch.attempts !== undefined) row.attempts = patch.attempts;
      if (patch.lastError !== undefined) row.last_error = patch.lastError;
      check(await db.from("notification_log").update(row).eq("id", id));
    },
  };
}
