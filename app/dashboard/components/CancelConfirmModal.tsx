"use client";

import { useEffect } from "react";
import styles from "../dashboard.module.css";

interface CancelConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function CancelConfirmModal({
  isOpen,
  itemName,
  isLoading,
  onConfirm,
  onClose,
}: CancelConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <div className={styles.modal} style={{ maxWidth: 440 }}>
        <div className={styles.modalHeader}>
          <h2 id="cancel-modal-title" className={styles.modalTitle}>
            Batalkan Laporan
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isLoading}
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
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--muted, #59665d)" }}>
            Apakah Anda yakin ingin membatalkan laporan penjemputan untuk{" "}
            <strong style={{ color: "var(--ink, #1c2621)" }}>{itemName}</strong>?
            Tindakan ini tidak dapat dibatalkan kembali.
          </p>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={onClose}
            disabled={isLoading}
          >
            Kembali
          </button>
          <button
            type="button"
            className={styles.confirmDangerButton}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Membatalkan..." : "Ya, Batalkan Laporan"}
          </button>
        </div>
      </div>
    </div>
  );
}
