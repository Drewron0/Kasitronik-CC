"use client";

import { useEffect, useState } from "react";
import type { SubmissionItem } from "../interfaces/submission-item.interface";
import { formatRatingLabel } from "../utils/formatters";
import { rateCollectorAction } from "../actions/rate-collector.action";
import styles from "../dashboard.module.css";

interface CollectorRatingModalProps {
  item: SubmissionItem | null;
  onClose: () => void;
  onSuccess: (updated: {
    collector_rating: number;
    collector_review: string;
    rated_at: string;
  }) => void;
}

export default function CollectorRatingModal({
  item,
  onClose,
  onSuccess,
}: CollectorRatingModalProps) {
  const [selectedRating, setSelectedRating] = useState<number>(
    item?.collector_rating || 5
  );
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState<string>(item?.collector_review || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const activeRating = hoverRating || selectedRating;
  const collectorName = item.collector_name || "Mitra Resmi Kasitronik";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRating < 1 || selectedRating > 5) {
      setErrorMsg("Pilih nilai 1 sampai 5 bintang.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await rateCollectorAction({
      submissionId: item.id,
      rating: selectedRating,
      review: review.trim(),
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      onSuccess(res.data);
      onClose();
    } else {
      setErrorMsg(res.error || "Gagal menyimpan penilaian. Coba lagi.");
    }
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
      aria-labelledby="rating-modal-title"
    >
      <div className={`${styles.modal} ${styles.ratingModal}`}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 id="rating-modal-title" className={styles.modalTitle}>
            Beri Nilai Mitra
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Tutup form penilaian"
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

        <form onSubmit={handleSubmit}>
          <div className={styles.ratingModalBody}>
            {/* Collector Information */}
            <div className={styles.ratingCollectorInfo}>
              <h3 className={styles.ratingCollectorTitle}>{collectorName}</h3>
              <p className={styles.ratingCollectorSubtitle}>
                Penjemputan barang &quot;{item.item_name}&quot;
              </p>
            </div>

            {errorMsg ? (
              <div
                className={`${styles.alertBox} ${styles.alertError}`}
                style={{ margin: 0 }}
              >
                {errorMsg}
              </div>
            ) : null}

            {/* Interactive Stars Selector */}
            <div className={styles.starSelectorGroup}>
              <div
                className={styles.starSelectorRow}
                role="radiogroup"
                aria-label="Pilih jumlah bintang penilaian"
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeRating;

                  return (
                    <button
                      key={star}
                      type="button"
                      className={styles.starSelectButton}
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${star} bintang - ${formatRatingLabel(star)}`}
                      role="radio"
                      aria-checked={selectedRating === star}
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill={isFilled ? "#eab308" : "none"}
                        stroke={isFilled ? "#eab308" : "var(--border-hover)"}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  );
                })}
              </div>

              <span className={styles.activeScoreDescription}>
                {activeRating} / 5 • {formatRatingLabel(activeRating)}
              </span>
            </div>

            {/* Optional Review Textarea */}
            <div className={styles.ratingReviewField}>
              <label
                htmlFor="rating-review-input"
                className={styles.ratingReviewLabel}
              >
                Ulasan atau Catatan (Opsional)
              </label>
              <textarea
                id="rating-review-input"
                className={styles.ratingReviewTextarea}
                placeholder="Bagikan pengalaman Anda mengenai ketepatan waktu, keramahan, atau penanganan barang oleh mitra..."
                value={review}
                maxLength={1000}
                onChange={(e) => setReview(e.target.value)}
              />
              <span className={styles.ratingCharCounter}>
                {review.length} / 1000 karakter
              </span>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className={styles.promptRatingButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Kirim Penilaian"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
