"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { SubmissionItem } from "@/app/dashboard/interfaces/submission-item.interface";
import type { SubmissionStatus } from "@/app/dashboard/interfaces/submission-status.type";
import { getUserSubmissionsAction } from "@/app/dashboard/actions/get-user-submissions.action";
import { formatCategory, formatDate, formatStatus } from "@/app/dashboard/utils/formatters";
import { updateSubmissionDebugAction } from "../actions/update-submission-debug.action";
import styles from "../debug.module.css";

const DEFAULT_ACCESS_CODE = "kasitronik2026";
const STORAGE_KEY = "kasitronik_debug_unlocked";

const MITRA_PRESETS = [
  { name: "Budi Santoso", phone: "081234567890" },
  { name: "Siti Rahma", phone: "087812345678" },
  { name: "Agus Pratama", phone: "085612345678" },
];

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredUnlockStatus(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) === "true";
}

export default function DebugView() {
  const router = useRouter();
  const [manualUnlocked, setManualUnlocked] = useState(false);
  const storedUnlocked = useSyncExternalStore(
    subscribeStorage,
    getStoredUnlockStatus,
    () => false
  );
  const isUnlocked = storedUnlocked || manualUnlocked;

  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);

  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch submissions once unlocked
  useEffect(() => {
    if (!isUnlocked) return;

    let isMounted = true;

    async function loadData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login?redirect=/debug");
        return;
      }

      const res = await getUserSubmissionsAction();
      if (isMounted) {
        if (res.success && res.data) {
          setItems(res.data);
        } else if (res.error) {
          setFeedback({ type: "error", text: res.error });
        }
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isUnlocked, router]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCodeInput.trim() === DEFAULT_ACCESS_CODE) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, "true");
      }
      setManualUnlocked(true);
      setGateError(null);
    } else {
      setGateError("Kode akses tidak valid. Silakan coba lagi.");
    }
  };

  const handleLock = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setManualUnlocked(false);
    setAccessCodeInput("");
  };

  const handleStatusChange = async (
    item: SubmissionItem,
    newStatus: SubmissionStatus
  ) => {
    setActionInProgress(item.id + "-" + newStatus);
    setFeedback(null);

    // If moving to accepted / picked_up / completed and no collector yet, auto-assign default collector
    const needsCollector =
      (newStatus === "accepted" ||
        newStatus === "picked_up" ||
        newStatus === "completed") &&
      !item.collector_name;

    const payload = {
      submissionId: item.id,
      status: newStatus,
      collector_name: needsCollector ? MITRA_PRESETS[0].name : undefined,
      collector_phone: needsCollector ? MITRA_PRESETS[0].phone : undefined,
    };

    const res = await updateSubmissionDebugAction(payload);
    if (res.success) {
      setFeedback({
        type: "success",
        text: `Status ${item.item_name} berhasil diubah ke: ${formatStatus(newStatus)}.`,
      });
      // Refresh local state
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: newStatus,
                collector_name: needsCollector ? MITRA_PRESETS[0].name : i.collector_name,
                collector_phone: needsCollector ? MITRA_PRESETS[0].phone : i.collector_phone,
              }
            : i
        )
      );
    } else {
      setFeedback({
        type: "error",
        text: res.error || "Gagal memperbarui status.",
      });
    }

    setActionInProgress(null);
  };

  const handleSetMitra = async (
    item: SubmissionItem,
    collectorName: string,
    collectorPhone: string
  ) => {
    setActionInProgress(item.id + "-mitra");
    setFeedback(null);

    const res = await updateSubmissionDebugAction({
      submissionId: item.id,
      collector_name: collectorName,
      collector_phone: collectorPhone,
    });

    if (res.success) {
      setFeedback({
        type: "success",
        text: `Mitra penjemput ${item.item_name} diperbarui ke ${collectorName}.`,
      });
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, collector_name: collectorName, collector_phone: collectorPhone }
            : i
        )
      );
    } else {
      setFeedback({
        type: "error",
        text: res.error || "Gagal memperbarui mitra.",
      });
    }

    setActionInProgress(null);
  };

  const handleResetRating = async (item: SubmissionItem) => {
    setActionInProgress(item.id + "-reset-rating");
    setFeedback(null);

    const res = await updateSubmissionDebugAction({
      submissionId: item.id,
      reset_rating: true,
    });

    if (res.success) {
      setFeedback({
        type: "success",
        text: `Rating untuk ${item.item_name} berhasil direset.`,
      });
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, collector_rating: null, collector_review: "", rated_at: null }
            : i
        )
      );
    } else {
      setFeedback({
        type: "error",
        text: res.error || "Gagal mereset rating.",
      });
    }

    setActionInProgress(null);
  };

  // Render Gate Card if locked
  if (!isUnlocked) {
    return (
      <main className={styles.container}>
        <div className={styles.content}>
          <div className={styles.gateCard}>
            <div className={styles.gateHeader}>
              <h1 className={styles.gateTitle}>Panel Debug Sementara</h1>
              <p className={styles.gateDescription}>
                Halaman ini digunakan untuk menguji perubahan status laporan dan
                simulasi mitra secara langsung. Masukkan kode akses untuk melanjutkan.
              </p>
            </div>

            {gateError ? <div className={styles.gateError}>{gateError}</div> : null}

            <form onSubmit={handleUnlock} className={styles.gateForm}>
              <input
                type="password"
                className={styles.gateInput}
                placeholder="Masukkan kode akses..."
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                autoFocus
                required
              />
              <button type="submit" className={styles.gateSubmitButton}>
                Buka Panel Debug
              </button>
            </form>

            <Link href="/dashboard" className={styles.headerLink} style={{ alignSelf: "center" }}>
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        {/* Debug Header */}
        <header className={styles.debugHeader}>
          <div className={styles.debugTitleGroup}>
            <div className={styles.debugBadgeRow}>
              <h1 className={styles.debugTitle}>Panel Debug Laporan</h1>
              <span className={styles.debugTag}>Dev Tool</span>
            </div>
            <p className={styles.debugDescription}>
              Ubah status laporan dengan cepat untuk menguji alur penjemputan, rating, dan tanda terima.
            </p>
          </div>

          <div className={styles.debugActions}>
            <Link href="/dashboard" className={styles.headerLink}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Buka Dashboard</span>
            </Link>
            <button type="button" onClick={handleLock} className={styles.lockButton}>
              Kunci Panel
            </button>
          </div>
        </header>

        {/* Dynamic Alert */}
        {feedback ? (
          <div
            className={`${styles.alertBox} ${
              feedback.type === "success" ? styles.alertSuccess : styles.alertError
            }`}
          >
            <span>{feedback.text}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
              aria-label="Tutup notifikasi"
            >
              x
            </button>
          </div>
        ) : null}

        {/* Submissions List */}
        {isLoading ? (
          <div className={styles.emptyCard}>
            <span>Memuat data laporan...</span>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyCard}>
            <strong>Belum ada laporan</strong>
            <span>Daftarkan barang terlebih dahulu di halaman laporan.</span>
            <Link href="/reports/new" className={styles.headerLink} style={{ marginTop: 12 }}>
              Daftarkan Barang
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {items.map((item) => {
              const allStatuses: SubmissionStatus[] = [
                "pending",
                "accepted",
                "picked_up",
                "completed",
                "cancelled",
              ];

              return (
                <article key={item.id} className={styles.card}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardHeadInfo}>
                      <h2 className={styles.itemName}>{item.item_name}</h2>
                      <span className={styles.itemMeta}>
                        {formatCategory(item.category)} • Dilaporkan {formatDate(item.created_at)}
                      </span>
                    </div>

                    <div className={styles.statusIndicator} data-status={item.status}>
                      <span>Status: {formatStatus(item.status)}</span>
                    </div>
                  </div>

                  <div className={styles.controlGrid}>
                    {/* Status Changer Buttons */}
                    <div className={styles.controlSection}>
                      <span className={styles.controlLabel}>Ubah Status Langsung:</span>
                      <div className={styles.btnGroup}>
                        {allStatuses.map((st) => {
                          const isActive = item.status === st;
                          const isBusy = actionInProgress === `${item.id}-${st}`;

                          return (
                            <button
                              key={st}
                              type="button"
                              className={`${styles.statusButton} ${
                                isActive ? styles.statusButtonActive : ""
                              }`}
                              disabled={isActive || isBusy}
                              onClick={() => handleStatusChange(item, st)}
                            >
                              {isBusy ? "Mengubah..." : formatStatus(st)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mitra Assignment Presets */}
                    <div className={styles.controlSection}>
                      <span className={styles.controlLabel}>
                        Mitra Penjemput:{" "}
                        <strong style={{ color: "var(--ink)" }}>
                          {item.collector_name
                            ? `${item.collector_name} (${item.collector_phone || "-"})`
                            : "Belum Ditetapkan"}
                        </strong>
                      </span>
                      <div className={styles.btnGroup}>
                        {MITRA_PRESETS.map((m) => (
                          <button
                            key={m.name}
                            type="button"
                            className={styles.presetButton}
                            disabled={actionInProgress === `${item.id}-mitra`}
                            onClick={() => handleSetMitra(item, m.name, m.phone)}
                          >
                            Set: {m.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating Status & Reset */}
                    <div className={styles.controlSection}>
                      <span className={styles.controlLabel}>
                        Rating Pengepul:{" "}
                        <strong style={{ color: "var(--ink)" }}>
                          {item.collector_rating
                            ? `${item.collector_rating}/5 Bintang ${
                                item.collector_review ? `("${item.collector_review}")` : ""
                              }`
                            : "Belum Dinilai"}
                        </strong>
                      </span>
                      {item.collector_rating ? (
                        <div className={styles.btnGroup}>
                          <button
                            type="button"
                            className={styles.resetRatingButton}
                            disabled={actionInProgress === `${item.id}-reset-rating`}
                            onClick={() => handleResetRating(item)}
                          >
                            Reset Rating ke Belum Dinilai
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
