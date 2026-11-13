"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { SubmissionItem } from "../interfaces/submission-item.interface";
import { formatCategory, formatCondition, formatDate, formatRatingLabel, formatWeight } from "../utils/formatters";
import styles from "../dashboard.module.css";

interface ReceiptModalProps {
  item: SubmissionItem | null;
  onClose: () => void;
}

export default function ReceiptModal({ item, onClose }: ReceiptModalProps) {
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

  const receiptNumber = `KST-${item.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

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
      aria-labelledby="receipt-modal-title"
    >
      <div className={`${styles.modal} ${styles.receiptModal}`}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2 id="receipt-modal-title" className={styles.modalTitle}>
            Bukti Serah Terima
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Tutup bukti serah terima"
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

        {/* Printable Receipt Paper */}
        <div className={styles.receiptPaper} id="printable-receipt">
          {/* Receipt Brand Header */}
          <div className={styles.receiptHeader}>
            <div className={styles.receiptBrand}>
              <Image
                src="/logo.svg"
                alt="Kasitronik"
                width={38}
                height={38}
                priority
              />
              <div>
                <span className={styles.receiptBrandTitle}>Kasitronik</span>
                <span className={styles.receiptBrandSubtitle}>Platform Daur Ulang E-Waste Terpadu</span>
              </div>
            </div>
            <div className={styles.receiptMeta}>
              <span className={styles.receiptNumber}>{receiptNumber}</span>
              <span className={styles.receiptDate}>{formatDate(item.created_at)}</span>
            </div>
          </div>

          <div className={styles.receiptDivider} />

          {/* Receipt Title */}
          <div className={styles.receiptDocumentHeading}>
            <h3>Tanda Terima Penjemputan Elektronik Bekas</h3>
            <p>Bukti sah serah terima barang elektronik untuk pemrosesan daur ulang ramah lingkungan.</p>
          </div>

          {/* Receipt Data Table / Rows */}
          <div className={styles.receiptTable}>
            <div className={styles.receiptRow}>
              <span className={styles.receiptColLabel}>Nama Barang</span>
              <span className={styles.receiptColValue}>{item.item_name}</span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptColLabel}>Kategori</span>
              <span className={styles.receiptColValue}>{formatCategory(item.category)}</span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptColLabel}>Kondisi</span>
              <span className={styles.receiptColValue}>{formatCondition(item.condition)}</span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptColLabel}>Jumlah & Berat</span>
              <span className={styles.receiptColValue}>
                {item.quantity} Unit • {formatWeight(item)}
              </span>
            </div>
            {item.brand_model ? (
              <div className={styles.receiptRow}>
                <span className={styles.receiptColLabel}>Merek / Tipe</span>
                <span className={styles.receiptColValue}>{item.brand_model}</span>
              </div>
            ) : null}
            {item.pickup_address ? (
              <div className={styles.receiptRow}>
                <span className={styles.receiptColLabel}>Lokasi Penjemputan</span>
                <span className={styles.receiptColValue}>{item.pickup_address}</span>
              </div>
            ) : null}
            <div className={styles.receiptRow}>
              <span className={styles.receiptColLabel}>Mitra Penerima</span>
              <span className={styles.receiptColValue}>
                {item.collector_name || "Mitra Resmi Kasitronik"}
              </span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptColLabel}>Status Verifikasi</span>
              <span className={`${styles.receiptColValue} ${styles.receiptVerifiedText}`}>
                Selesai & Terverifikasi
              </span>
            </div>
            {item.collector_rating ? (
              <div className={styles.receiptRow}>
                <span className={styles.receiptColLabel}>Penilaian Layanan</span>
                <span className={styles.receiptColValue}>
                  {item.collector_rating} / 5 Bintang ({formatRatingLabel(item.collector_rating)})
                </span>
              </div>
            ) : null}
          </div>

          {/* Receipt Seal / Footer Note */}
          <div className={styles.receiptSealBox}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <div>
              <strong>Diverifikasi oleh Sistem Kasitronik</strong>
              <span>Barang ini telah diserahterimakan dan dicatat dalam rantai penanganan limbah elektronik berkelanjutan.</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handlePrint}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Cetak / Simpan PDF</span>
          </button>
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
