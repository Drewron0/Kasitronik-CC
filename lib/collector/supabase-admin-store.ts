import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminStore } from "./interfaces/admin-store.interface.ts";
import { check, COLLECTOR_COLUMNS, toCollector, toSubmission } from "./supabase-store.ts";

const UNIQUE_VIOLATION = "23505";

export function createSupabaseAdminStore(db: SupabaseClient): AdminStore {
  return {
    async listCollectors() {
      return (check(await db.from("collectors").select(COLLECTOR_COLUMNS).order("created_at", { ascending: false })) ?? []).map(toCollector);
    },
    async countPushTargets(collectorId) {
      const { count, error } = await db.from("push_subscriptions").select("id", { count: "exact", head: true }).eq("collector_id", collectorId);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
    async collectorStats(collectorId) {
      const rows = check(await db.from("item_submissions").select("status, collector_rating").eq("collector_id", collectorId)) ?? [];
      const ratings = rows.map(r => r.collector_rating as number | null).filter((r): r is number => r !== null);
      return {
        rating: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null,
        completedJobs: rows.filter(r => r.status === "completed").length,
      };
    },
    async createCollector(row) {
      const { data, error } = await db.from("collectors")
        .insert({ name: row.name, phone: row.phone, notify_mode: row.notifyMode, access_token_hash: row.accessTokenHash })
        .select("id").single();
      if (error?.code === UNIQUE_VIOLATION) return { duplicate: true };
      if (error) throw new Error(error.message);
      return { id: data.id as string };
    },
    async updateCollector(id, patch) {
      if (!Object.keys(patch).length) {
        return Boolean(check(await db.from("collectors").select("id").eq("id", id).maybeSingle()));
      }
      const { data, error } = await db.from("collectors").update(patch).eq("id", id).select("id");
      if (error?.code === UNIQUE_VIOLATION) return "duplicate";
      if (error) throw new Error(error.message);
      return (data ?? []).length === 1;
    },
    async replaceAreas(collectorId, areas) {
      check(await db.from("collector_areas").delete().eq("collector_id", collectorId));
      if (areas.length) {
        check(await db.from("collector_areas").insert(areas.map(a => ({ collector_id: collectorId, center_latitude: a.latitude, center_longitude: a.longitude, radius_km: a.radiusKm }))));
      }
    },
    async listEscalated(minWaves) {
      return (check(await db.from("item_submissions").select("*").eq("status", "pending").gte("wave_count", minWaves).order("created_at")) ?? []).map(toSubmission);
    },
    async listOpenProblems() {
      return (check(await db.from("problem_reports").select("*").is("resolved_at", null).order("created_at", { ascending: false })) ?? []).map(r => ({
        id: r.id as string,
        submissionId: r.submission_id as string,
        ownerId: r.owner_id as string,
        message: r.message as string,
        createdAt: r.created_at as string,
        resolvedAt: null,
      }));
    },
    async resolveProblem(id, at) {
      const data = check(await db.from("problem_reports").update({ resolved_at: at }).eq("id", id).is("resolved_at", null).select("id"));
      return (data ?? []).length === 1;
    },
  };
}
