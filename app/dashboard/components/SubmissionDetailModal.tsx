"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { SubmissionItem } from "../interfaces/submission-item.interface";
import { formatCategory, formatCondition, formatDate, formatWeight } from "../utils/formatters";
import StatusStepper from "./StatusStepper";
import styles from "../dashboard.module.css";

interface SubmissionDetailModalProps {
  item: SubmissionItem | null;
  onClose: () => void;
  onRequestCancel?: (item: SubmissionItem) => void;
}

export default function SubmissionDetailModal({
  item,
  onClose,
  onRequestCancel,
}: SubmissionDetailModalProps) {
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
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
          {/* Progress / Status */}
          <StatusStepper status={item.status} />

          {/* Photo Preview */}
          {item.photo_url ? (
            <div className={styles.modalPhotoWrapper}>
              <Image
                src={item.photo_url}
                alt={item.item_name}
                fill
                className={styles.thumbnailImage}
                sizes="(max-width: 600px) 100vw, 560px"
              />
            </div>
          ) : null}

          {/* Key Details */}
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Nama Barang</span>
              <span className={styles.detailValue}>{item.item_name}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Merek / Tipe</span>
              <span className={styles.detailValue}>{item.brand_model || "-"}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Kategori</span>
              <span className={styles.detailValue}>{formatCategory(item.category)}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Kondisi</span>
              <span className={styles.detailValue}>{formatCondition(item.condition)}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Jumlah</span>
              <span className={styles.detailValue}>{item.quantity} Unit</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Estimasi Berat</span>
              <span className={styles.detailValue}>{formatWeight(item)}</span>
            </div>

            <div className={styles.detailItemFull}>
              <span className={styles.detailLabel}>Tanggal Dilaporkan</span>
              <span className={styles.detailValue}>{formatDate(item.created_at)}</span>
            </div>

            {item.pickup_address ? (
              <div className={styles.detailItemFull}>
                <span className={styles.detailLabel}>Lokasi Penjemputan</span>
                <span className={styles.detailValue}>{item.pickup_address}</span>
              </div>
            ) : null}

            {item.pickup_instructions ? (
              <div className={styles.detailItemFull}>
                <span className={styles.detailLabel}>Patokan / Catatan Lokasi</span>
                <span className={styles.detailValue}>{item.pickup_instructions}</span>
              </div>
            ) : null}

            {item.notes ? (
              <div className={styles.detailItemFull}>
                <span className={styles.detailLabel}>Catatan Tambahan</span>
                <span className={styles.detailValue}>{item.notes}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.modalFooter}>
          {item.status === "pending" && onRequestCancel ? (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.cancelButton}`}
              onClick={() => {
                onClose();
                onRequestCancel(item);
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
  );
}
