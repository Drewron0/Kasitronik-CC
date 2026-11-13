"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { SubmissionItem } from "../interfaces/submission-item.interface";
import type { DashboardFilter } from "../interfaces/dashboard-filter.type";
import { getUserSubmissionsAction } from "../actions/get-user-submissions.action";
import { cancelSubmissionAction } from "../actions/cancel-submission.action";
import { formatCategory } from "../utils/formatters";
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>("all");
  const [selectedDetailItem, setSelectedDetailItem] = useState<SubmissionItem | null>(null);
  const [cancelTargetItem, setCancelTargetItem] = useState<SubmissionItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
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

    fetchData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login?redirectTo=/dashboard");
      }
    });

    const handleFocus = () => {
      getUserSubmissionsAction().then((res) => {
        if (isMounted && res.success && res.data) {
          setItems(res.data);
        }
      });
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setActionError(null);
    const res = await getUserSubmissionsAction();
    if (res.success && res.data) {
      setItems(res.data);
    } else if (res.error) {
      setActionError(res.error);
    }
    setIsRefreshing(false);
  };

  const counts = useMemo(() => {
    return {
      all: items.length,
      active: items.filter((i) => i.status === "pending" || i.status === "accepted" || i.status === "picked_up").length,
      completed: items.filter((i) => i.status === "completed").length,
      cancelled: items.filter((i) => i.status === "cancelled").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    let list = items;

    switch (activeFilter) {
      case "active":
        list = list.filter((i) => i.status === "pending" || i.status === "accepted" || i.status === "picked_up");
        break;
      case "completed":
        list = list.filter((i) => i.status === "completed");
        break;
      case "cancelled":
        list = list.filter((i) => i.status === "cancelled");
        break;
      case "all":
      default:
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.item_name.toLowerCase().includes(q) ||
          i.brand_model.toLowerCase().includes(q) ||
          formatCategory(i.category).toLowerCase().includes(q)
      );
    }

    return list;
  }, [items, activeFilter, searchQuery]);

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
        <div className={styles.errorBanner}>
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

      {/* Controls Row: Search Bar & Refresh Button (Features 2 & 4) */}
      <div className={styles.controlsRow}>
        <div className={styles.searchContainer}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Cari nama barang, kategori, merek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Cari riwayat laporan"
          />
          {searchQuery ? (
            <button
              type="button"
              className={styles.searchClearButton}
              onClick={() => setSearchQuery("")}
              aria-label="Hapus kata kunci pencarian"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : null}
        </div>

        <button
          type="button"
          className={`${styles.refreshButton} ${isRefreshing ? styles.refreshButtonSpinning : ""}`}
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          title="Perbarui data laporan"
          aria-label="Perbarui data laporan"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {/* Content: Skeleton, Empty State, or Cards */}
      {isLoading ? (
        <div className={styles.cardsList}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.skeletonCard}>
              <div className={styles.cardMain}>
                <div className={styles.skeletonThumbnail} />
                <div className={styles.skeletonLines}>
                  <div className={styles.skeletonLine} style={{ width: "25%" }} />
                  <div className={styles.skeletonLine} style={{ width: "65%", height: 16 }} />
                  <div className={styles.skeletonLine} style={{ width: "35%" }} />
                </div>
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
              onCancel={setCancelTargetItem}
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
            {searchQuery
              ? "Tidak Ada Laporan yang Cocok"
              : activeFilter === "all"
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
            {searchQuery
              ? `Tidak ditemukan laporan dengan kata kunci "${searchQuery}". Coba kata kunci lain atau hapus pencarian.`
              : activeFilter === "all"
              ? "Anda belum pernah mendaftarkan barang elektronik bekas untuk didaur ulang atau dijemput."
              : "Belum ada item dalam kategori status ini."}
          </p>
          {searchQuery ? (
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => setSearchQuery("")}
            >
              Hapus Pencarian
            </button>
          ) : (
            <Link href="/reports/new" className={styles.newReportButton}>
              <span>Daftarkan Barang Sekarang</span>
            </Link>
          )}
        </div>
      )}

      {/* Modals */}
      <SubmissionDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        onRequestCancel={(item) => setCancelTargetItem(item)}
        onUpdateItem={(updated) => {
          setSelectedDetailItem(updated);
          setItems((prev) =>
            prev.map((i) => (i.id === updated.id ? updated : i))
          );
        }}
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
