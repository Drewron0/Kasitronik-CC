"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { SubmissionItem } from "../interfaces/submission-item.interface";
import type { DashboardFilter } from "../interfaces/dashboard-filter.type";
import { getUserSubmissionsAction } from "../actions/get-user-submissions.action";
import { cancelSubmissionAction } from "../actions/cancel-submission.action";
import SubmissionCard from "./SubmissionCard";
import SubmissionDetailModal from "./SubmissionDetailModal";
import CancelConfirmModal from "./CancelConfirmModal";
import styles from "../dashboard.module.css";

const TABS: { key: DashboardFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Berjalan" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" },
];

export default function DashboardView() {
  const router = useRouter();
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>("all");
  const [selectedDetailItem, setSelectedDetailItem] = useState<SubmissionItem | null>(null);
  const [cancelTargetItem, setCancelTargetItem] = useState<SubmissionItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login?redirectTo=/dashboard");
        return;
      }

      const res = await getUserSubmissionsAction();
      if (!isMounted) return;

      if (res.success && res.data) {
        setItems(res.data);
      } else if (res.error) {
        setActionError(res.error);
      }
      setIsLoading(false);
    }

    loadData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login?redirectTo=/dashboard");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const counts = useMemo(() => {
    return {
      all: items.length,
      active: items.filter((i) => i.status === "pending" || i.status === "accepted" || i.status === "picked_up").length,
      completed: items.filter((i) => i.status === "completed").length,
      cancelled: items.filter((i) => i.status === "cancelled").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    switch (activeFilter) {
      case "active":
        return items.filter((i) => i.status === "pending" || i.status === "accepted" || i.status === "picked_up");
      case "completed":
        return items.filter((i) => i.status === "completed");
      case "cancelled":
        return items.filter((i) => i.status === "cancelled");
      case "all":
      default:
        return items;
    }
  }, [items, activeFilter]);

  const handleConfirmCancel = async () => {
    if (!cancelTargetItem) return;
    setIsCancelling(true);
    setActionError(null);

    const result = await cancelSubmissionAction(cancelTargetItem.id);

    if (result.success) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === cancelTargetItem.id ? { ...item, status: "cancelled" } : item
        )
      );
      if (selectedDetailItem?.id === cancelTargetItem.id) {
        setSelectedDetailItem((prev) => (prev ? { ...prev, status: "cancelled" } : null));
      }
      setCancelTargetItem(null);
    } else {
      setActionError(result.error || "Gagal membatalkan laporan.");
    }

    setIsCancelling(false);
  };

  return (
    <>
      {/* Header Area */}
      <section className={styles.headerArea}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Dashboard Saya</p>
          <h1 className={styles.title}>Status Penjemputan Elektronik</h1>
          <p className={styles.description}>
            Pantau status verifikasi, penerimaan oleh mitra pengepul, penjemputan barang, hingga proses serah terima selesai secara transparan.
          </p>
        </div>

        <Link href="/reports/new" className={styles.newReportButton}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Buat Laporan Baru</span>
        </Link>
      </section>

      {/* Action Error Alert if any */}
      {actionError ? (
        <div className={styles.cancelledBanner} style={{ marginBottom: 20 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{actionError}</span>
        </div>
      ) : null}

      {/* Filter Tabs */}
      <nav className={styles.filterBar} aria-label="Filter status laporan">
        {TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count = counts[tab.key];

          return (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              <span>{tab.label}</span>
              <span className={styles.tabBadge}>{count}</span>
            </button>
          );
        })}
      </nav>

      {/* Content: Skeleton, Empty State, or Cards */}
      {isLoading ? (
        <div className={styles.cardsList}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.skeletonCard}>
              <div className={styles.skeletonThumbnail} />
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonLine} style={{ width: "25%" }} />
                <div className={styles.skeletonLine} style={{ width: "65%", height: 16 }} />
                <div className={styles.skeletonLine} style={{ width: "35%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className={styles.cardsList}>
          {filteredItems.map((item) => (
            <SubmissionCard
              key={item.id}
              item={item}
              onClick={setSelectedDetailItem}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <svg
            className={styles.emptyIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <h2 className={styles.emptyTitle}>
            {activeFilter === "all"
              ? "Belum Ada Laporan"
              : `Tidak Ada Laporan ${
                  activeFilter === "active"
                    ? "yang Sedang Berjalan"
                    : activeFilter === "completed"
                    ? "yang Selesai"
                    : "yang Dibatalkan"
                }`}
          </h2>
          <p className={styles.emptyText}>
            {activeFilter === "all"
              ? "Anda belum pernah mendaftarkan barang elektronik bekas untuk didaur ulang atau dijemput."
              : "Belum ada item dalam kategori status ini."}
          </p>
          <Link href="/reports/new" className={styles.newReportButton}>
            <span>Daftarkan Barang Sekarang</span>
          </Link>
        </div>
      )}

      {/* Modals */}
      <SubmissionDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onRequestCancel={(item) => setCancelTargetItem(item)}
      />

      <CancelConfirmModal
        isOpen={Boolean(cancelTargetItem)}
        itemName={cancelTargetItem?.item_name || ""}
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelTargetItem(null)}
      />
    </>
  );
}
