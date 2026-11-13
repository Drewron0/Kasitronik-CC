"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { SubmissionItem } from "../interfaces/submission-item.interface";
import {
  formatCategory,
  formatCondition,
  formatDate,
  formatRatingLabel,
  formatWeight,
} from "../utils/formatters";
import StatusStepper from "./StatusStepper";
import ReceiptModal from "./ReceiptModal";
import CollectorRatingModal from "./CollectorRatingModal";
import styles from "../dashboard.module.css";

interface SubmissionDetailModalProps {
  item: SubmissionItem | null;
  onClose: () => void;
  onRequestCancel?: (item: SubmissionItem) => void;
  onUpdateItem?: (updatedItem: SubmissionItem) => void;
}

export default function SubmissionDetailModal({
  item,
  onClose,
  onRequestCancel,
  onUpdateItem,
}: SubmissionDetailModalProps) {
  const [failedPhotoId, setFailedPhotoId] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratedUpdates, setRatedUpdates] = useState<{
    id: string;
    collector_rating: number;
    collector_review: string;
    rated_at: string;
  } | null>(null);

  const activeItem = useMemo(() => {
    if (!item) return null;
    if (ratedUpdates && ratedUpdates.id === item.id) {
      return {
        ...item,
        collector_rating: ratedUpdates.collector_rating,
        collector_review: ratedUpdates.collector_review,
        rated_at: ratedUpdates.rated_at,
      };
    }
    return item;
  }, [item, ratedUpdates]);

  const isImgError = activeItem ? failedPhotoId === activeItem.id : false;

  useEffect(() => {
    if (!activeItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItem, onClose]);

  if (!activeItem) return null;

  const handleRatingSuccess = (updated: {
    collector_rating: number;
    collector_review: string;
    rated_at: string;
  }) => {
    setRatedUpdates({
      id: activeItem.id,
      collector_rating: updated.collector_rating,
      collector_review: updated.collector_review,
      rated_at: updated.rated_at,
    });
    if (onUpdateItem) {
      onUpdateItem({
        ...activeItem,
        collector_rating: updated.collector_rating,
        collector_review: updated.collector_review,
        rated_at: updated.rated_at,
      });
    }
  };

  return (
    <>
      <div
        className={styles.modalBackdrop}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
      >
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2 id="detail-modal-title" className={styles.modalTitle}>
              Detail Laporan
            </h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Tutup modal"
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className={styles.modalBody}>
            {/* Progress / Status Section */}
            <div className={styles.modalStepperSection}>
              <StatusStepper status={activeItem.status} />
            </div>

            {/* Photo Preview if available */}
            {activeItem.photo_url && !isImgError ? (
              <div className={styles.modalPhotoWrapper}>
                <Image
                  src={activeItem.photo_url}
                  alt={activeItem.item_name}
                  fill
                  className={styles.thumbnailImage}
                  sizes="(max-width: 640px) 100vw, 520px"
                  onError={() => setFailedPhotoId(activeItem.id)}
                />
              </div>
            ) : null}

            {/* Key Specifications Grid */}
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Nama Barang</span>
                <span className={styles.detailValue}>{activeItem.item_name}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Kategori</span>
                <span className={styles.detailValue}>{formatCategory(activeItem.category)}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Kondisi Barang</span>
                <span className={styles.detailValue}>{formatCondition(activeItem.condition)}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Jumlah & Estimasi Berat</span>
                <span className={styles.detailValue}>
                  {activeItem.quantity} Unit • {formatWeight(activeItem)}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Tanggal Dilaporkan</span>
                <span className={styles.detailValue}>{formatDate(activeItem.created_at)}</span>
              </div>

              {activeItem.brand_model ? (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Merek / Tipe</span>
                  <span className={styles.detailValue}>{activeItem.brand_model}</span>
                </div>
              ) : null}
            </div>

            {/* Mitra Pengepul Information (Feature 1) */}
            {activeItem.status !== "pending" && activeItem.status !== "cancelled" ? (
              <div className={styles.infoBox}>
                <span className={styles.detailLabel}>Mitra Pengepul Penjemput</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <span className={styles.detailValue} style={{ fontWeight: 600 }}>
                    {activeItem.collector_name || "Mitra Resmi Kasitronik"}
                  </span>
                  {activeItem.collector_phone ? (
                    <a
                      href={`https://wa.me/${activeItem.collector_phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.collectorContactLink}
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
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>Hubungi Mitra ({activeItem.collector_phone})</span>
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Rating Section when completed */}
            {activeItem.status === "completed" ? (
              activeItem.collector_rating ? (
                <div className={styles.ratedCard}>
                  <div className={styles.ratedCardHeader}>
                    <span className={styles.ratedCardTitle}>Penilaian Mitra Penjemput</span>
                    {activeItem.rated_at ? (
                      <span className={styles.ratedDateText}>
                        Dinilai {formatDate(activeItem.rated_at)}
                      </span>
                    ) : null}
                  </div>
                  <div className={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        className={
                          s <= (activeItem.collector_rating || 0)
                            ? styles.starIcon
                            : styles.starIconEmpty
                        }
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={
                          s <= (activeItem.collector_rating || 0)
                            ? "#eab308"
                            : "none"
                        }
                        stroke={
                          s <= (activeItem.collector_rating || 0)
                            ? "#eab308"
                            : "currentColor"
                        }
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                    <span className={styles.ratingScoreLabel}>
                      {activeItem.collector_rating} / 5 •{" "}
                      {formatRatingLabel(activeItem.collector_rating)}
                    </span>
                  </div>
                  {activeItem.collector_review ? (
                    <blockquote className={styles.ratedReviewQuote}>
                      &quot;{activeItem.collector_review}&quot;
                    </blockquote>
                  ) : null}
                </div>
              ) : (
                <div className={styles.promptRatingCard}>
                  <div className={styles.promptRatingText}>
                    <strong className={styles.promptRatingTitle}>
                      Beri Nilai Layanan Mitra
                    </strong>
                    <span className={styles.promptRatingDesc}>
                      Bagikan pengalaman Anda bersama Mitra penjemput untuk menjaga kualitas layanan.
                    </span>
                  </div>
                  <button
                    type="button"
                    className={styles.promptRatingButton}
                    onClick={() => setShowRatingModal(true)}
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
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>Beri Nilai Mitra</span>
                  </button>
                </div>
              )
            ) : null}

            {/* Pickup Address & Instructions */}
            {activeItem.pickup_address ? (
              <div className={styles.infoBox}>
                <span className={styles.detailLabel}>Lokasi Penjemputan</span>
                <span className={styles.detailValue} style={{ fontWeight: 500 }}>
                  {activeItem.pickup_address}
                </span>
                {activeItem.pickup_instructions ? (
                  <span style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                    Patokan: {activeItem.pickup_instructions}
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* Additional Notes */}
            {activeItem.notes ? (
              <div className={styles.infoBox}>
                <span className={styles.detailLabel}>Catatan Tambahan</span>
                <span style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.5 }}>
                  {activeItem.notes}
                </span>
              </div>
            ) : null}
          </div>

          <div className={styles.modalFooter}>
            {/* Eco-Receipt Button when completed (Feature 3) */}
            {activeItem.status === "completed" ? (
              <>
                {!activeItem.collector_rating && (
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => setShowRatingModal(true)}
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
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>Beri Nilai Mitra</span>
                  </button>
                )}
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setShowReceipt(true)}
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span>Bukti Serah Terima</span>
                </button>
              </>
            ) : null}

            {activeItem.status === "pending" && onRequestCancel ? (
              <button
                type="button"
                className={`${styles.actionButton} ${styles.cancelButton}`}
                onClick={() => {
                  onClose();
                  onRequestCancel(activeItem);
                }}
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>Batalkan Laporan</span>
              </button>
            ) : null}

            <button
              type="button"
              className={styles.actionButton}
              onClick={onClose}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Render Receipt Modal */}
      {showReceipt && (
        <ReceiptModal item={activeItem} onClose={() => setShowReceipt(false)} />
      )}

      {/* Render Rating Modal */}
      {showRatingModal && (
        <CollectorRatingModal
          item={activeItem}
          onClose={() => setShowRatingModal(false)}
          onSuccess={handleRatingSuccess}
        />
      )}
    </>
  );
}
