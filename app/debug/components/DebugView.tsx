"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SubmissionCard from "@/app/dashboard/components/SubmissionCard";
import CollectorPanel from "@/app/dashboard/components/CollectorPanel";
import RatingForm from "@/app/dashboard/components/RatingForm";
import type { SubmissionItem } from "@/app/dashboard/interfaces/submission-item.interface";
import type { SubmissionStatus } from "@/app/dashboard/interfaces/submission-status.type";
import type { DebugSubmissionRow } from "../interfaces/debug-submission.interface";
import styles from "../debug.module.css";

type PreviewScenario = "pending" | "accepted" | "completed_unrated" | "completed_rated" | "cancelled";

const SCENARIO_LABELS: Record<PreviewScenario, string> = {
  pending: "Menunggu Pengepul",
  accepted: "Dijemput (Ada Pengepul & Kode)",
  completed_unrated: "Selesai (Belum Dirating)",
  completed_rated: "Selesai (Sudah Dirating)",
  cancelled: "Dibatalkan",
};

const PREVIEW_TIMESTAMP = "2026-11-27T02:30:00.000Z";

function buildPreviewItem(scenario: PreviewScenario): SubmissionItem {
  const statusMap: Record<PreviewScenario, SubmissionStatus> = {
    pending: "pending",
    accepted: "accepted",
    completed_unrated: "completed",
    completed_rated: "completed",
    cancelled: "cancelled",
  };
  const hasCollector = scenario === "accepted" || scenario === "completed_unrated" || scenario === "completed_rated";
  return {
    id: "00000000-0000-0000-0000-000000000001",
    owner_id: "00000000-0000-0000-0000-000000000002",
    category: "computers",
    item_name: "Laptop ASUS VivoBook 14",
    brand_model: "ASUS X412",
    quantity: 1,
    condition: "damaged",
    notes: "Layar retak, baterai masih menyala.",
    weight_kind: "estimate",
    weight_kg: null,
    weight_min_kg: 1.5,
    weight_max_kg: 2.2,
    photo_path: "",
    photo_url: null,
    status: statusMap[scenario],
    created_at: PREVIEW_TIMESTAMP,
    pickup_latitude: -7.2892,
    pickup_longitude: 112.6319,
    pickup_address: "CitraLand Surabaya",
    pickup_instructions: "Gerbang depan",
    owner_phone: "6281234567890",
    pickup_district: "Sambikerep",
    handover_code: scenario === "accepted" ? "4829" : null,
    agreed_price_idr: scenario.startsWith("completed") ? 150000 : null,
    claimed_at: hasCollector ? PREVIEW_TIMESTAMP : null,
    completed_at: scenario.startsWith("completed") ? PREVIEW_TIMESTAMP : null,
    collector: hasCollector
      ? {
          name: "Budi Santoso",
          phone: "6281234567890",
          rating: 4.8,
          completedJobs: 14,
        }
      : null,
    collector_rating: scenario === "completed_rated" ? 5 : null,
    collector_review: scenario === "completed_rated" ? "Cepat dan ramah." : null,
    rated_at: scenario === "completed_rated" ? PREVIEW_TIMESTAMP : null,
  };
}

export default function DebugView() {
  const [tab, setTab] = useState<"preview" | "database">("preview");
  const [scenario, setScenario] = useState<PreviewScenario>("accepted");
  const [rows, setRows] = useState<DebugSubmissionRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRows = useCallback(async () => {
    setError("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Masuk terlebih dahulu untuk melihat dan mengubah laporan Anda.");
      return;
    }
    const res = await fetch("/api/debug/submissions", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const body = (await res.json()) as { submissions?: DebugSubmissionRow[]; error?: string };
    if (!res.ok) {
      setError(body.error ?? "Gagal memuat data debug.");
      return;
    }
    setRows(body.submissions ?? []);
  }, []);

  async function openDatabaseTab() {
    setTab("database");
    await loadRows();
  }

  async function updateStatus(
    submissionId: string,
    status: SubmissionStatus,
    resetRating = false
  ) {
    setError("");
    setNotice("");
    setBusyId(submissionId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Sesi tidak ditemukan. Silakan masuk kembali.");
        return;
      }
      const res = await fetch("/api/debug/submissions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          submissionId,
          status,
          assignCollector: status === "accepted" || status === "completed",
          resetRating,
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Gagal memperbarui status.");
        return;
      }
      setNotice(`Status diperbarui menjadi ${status}. Buka Dashboard untuk melihat hasilnya.`);
      await loadRows();
    } finally {
      setBusyId(null);
    }
  }

  const previewItem = buildPreviewItem(scenario);

  return (
    <div className={styles.main}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>DEBUG &amp; PRATINJAU</p>
        <h1>Pengujian Alur Laporan</h1>
        <p>Uji tampilan card pengepul, rating, serta ubah status laporan Anda.</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabGroup} role="group" aria-label="Mode debug">
          <button
            type="button"
            className={styles.tabButton}
            aria-pressed={tab === "preview"}
            onClick={() => setTab("preview")}
          >
            Pratinjau UI
          </button>
          <button
            type="button"
            className={styles.tabButton}
            aria-pressed={tab === "database"}
            onClick={() => void openDatabaseTab()}
          >
            Ubah Status Database
          </button>
        </div>

        <Link href="/dashboard" className={styles.linkButton}>
          Buka Dashboard
        </Link>
      </div>

      {tab === "preview" ? (
        <section className={styles.panel} aria-label="Pratinjau komponen UI">
          <div className={styles.previewControls} role="group" aria-label="Pilih skenario status">
            {(Object.keys(SCENARIO_LABELS) as PreviewScenario[]).map(key => (
              <button
                key={key}
                type="button"
                className={styles.actionBtn}
                aria-pressed={scenario === key}
                onClick={() => setScenario(key)}
              >
                {SCENARIO_LABELS[key]}
              </button>
            ))}
          </div>

          <div className={styles.previewGrid}>
            <SubmissionCard
              item={previewItem}
              onClick={() => {}}
              onCancel={() => {}}
            />
            <CollectorPanel item={previewItem} />
            <RatingForm key={scenario} item={previewItem} />
          </div>
        </section>
      ) : (
        <section className={styles.panel} aria-label="Daftar laporan untuk debug">
          {error && <p className={styles.errorText} role="alert">{error}</p>}
          {notice && <p className={styles.statusText} role="status">{notice}</p>}

          {rows.length === 0 && !error ? (
            <p className={styles.rowSub}>Belum ada laporan pada akun ini.</p>
          ) : (
            rows.map(row => (
              <div key={row.id} className={styles.row}>
                <div className={styles.rowMeta}>
                  <span className={styles.rowTitle}>{row.item_name}</span>
                  <span className={styles.rowSub}>
                    Status: {row.status}
                    {row.handover_code ? ` • Kode: ${row.handover_code}` : ""}
                    {row.collector_rating !== null ? ` • Rating: ${row.collector_rating}/5` : ""}
                  </span>
                </div>
                <div className={styles.rowActions}>
                  {(["pending", "accepted", "completed", "cancelled"] as SubmissionStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      className={styles.actionBtn}
                      aria-pressed={row.status === st}
                      disabled={busyId === row.id}
                      onClick={() => void updateStatus(row.id, st)}
                    >
                      {st}
                    </button>
                  ))}
                  {row.collector_rating !== null && (
                    <button
                      type="button"
                      className={styles.actionBtn}
                      disabled={busyId === row.id}
                      onClick={() => void updateStatus(row.id, "completed", true)}
                    >
                      Reset rating
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}
