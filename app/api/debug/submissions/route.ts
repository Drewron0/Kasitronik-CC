import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import type { SubmissionStatus } from "@/app/dashboard/interfaces/submission-status.type";

const ALLOWED_STATUSES: SubmissionStatus[] = [
  "pending",
  "accepted",
  "picked_up",
  "completed",
  "cancelled",
];

function isDebugAllowed(request: Request): boolean {
  const configuredCode = process.env.DEBUG_ACCESS_CODE;
  if (process.env.NODE_ENV !== "production") {
    if (!configuredCode) return true;
    return request.headers.get("x-debug-code") === configuredCode;
  }
  return Boolean(configuredCode && request.headers.get("x-debug-code") === configuredCode);
}

async function getAuthenticatedUserId(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return null;
  const admin = getAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

async function ensureDebugCollectorId(): Promise<string> {
  const admin = getAdminClient();
  const { data: existing } = await admin
    .from("collectors")
    .select("id")
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(1);

  if (existing && existing.length > 0) {
    return existing[0].id as string;
  }

  const crypto = await import("node:crypto");
  const tokenHash = crypto.createHash("sha256").update("debug-collector-token").digest("hex");
  const { data: created, error } = await admin
    .from("collectors")
    .insert({
      name: "Budi Santoso (Debug)",
      phone: "6281234567890",
      active: true,
      paused: false,
      notify_mode: "instant",
      access_token_hash: tokenHash,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error("Gagal menyiapkan pengepul debug.");
  }
  return created.id as string;
}

export async function GET(request: Request) {
  if (!isDebugAllowed(request)) {
    return NextResponse.json({ error: "Tidak tersedia." }, { status: 404 });
  }
  if (!process.env.SUPABASE_SECRET_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SECRET_KEY belum diisi di .env." },
      { status: 503 }
    );
  }

  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Masuk terlebih dahulu." }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("item_submissions")
      .select("id, item_name, status, handover_code, collector_id, collector_rating, created_at")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submissions: data ?? [] });
  } catch (cause) {
    return NextResponse.json(
      { error: cause instanceof Error ? cause.message : "Gagal memuat data debug." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!isDebugAllowed(request)) {
    return NextResponse.json({ error: "Tidak tersedia." }, { status: 404 });
  }
  if (!process.env.SUPABASE_SECRET_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SECRET_KEY belum diisi di .env." },
      { status: 503 }
    );
  }

  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Masuk terlebih dahulu." }, { status: 401 });
    }

    const body = (await request.json()) as {
      submissionId?: string;
      status?: SubmissionStatus;
      assignCollector?: boolean;
      resetRating?: boolean;
    };

    if (!body.submissionId || !body.status || !ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Parameter debug tidak valid." }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: current, error: fetchError } = await admin
      .from("item_submissions")
      .select("id, owner_id, collector_id, handover_code")
      .eq("id", body.submissionId)
      .eq("owner_id", userId)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "Laporan tidak ditemukan." }, { status: 404 });
    }

    const patch: Record<string, unknown> = { status: body.status };

    if (body.status === "pending" || body.status === "cancelled") {
      if (body.status === "pending") {
        patch.collector_id = null;
        patch.claimed_at = null;
      }
      patch.completed_at = null;
    }

    if (body.status === "accepted" || body.status === "completed") {
      if (!current.collector_id || body.assignCollector) {
        patch.collector_id = await ensureDebugCollectorId();
        patch.claimed_at = new Date().toISOString();
      }
      if (!current.handover_code) {
        patch.handover_code = String(Math.floor(1000 + Math.random() * 9000));
      }
      if (body.status === "completed") {
        patch.completed_at = new Date().toISOString();
      } else {
        patch.completed_at = null;
      }
    }

    if (body.resetRating) {
      patch.collector_rating = null;
      patch.collector_review = null;
      patch.rated_at = null;
    }

    const { error: updateError } = await admin
      .from("item_submissions")
      .update(patch)
      .eq("id", body.submissionId)
      .eq("owner_id", userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (cause) {
    return NextResponse.json(
      { error: cause instanceof Error ? cause.message : "Gagal memperbarui status debug." },
      { status: 500 }
    );
  }
}
