"use client";

import { useState } from "react";
import { rateCollectorAction } from "../actions/rate-collector.action";
import type { RatingFormProps } from "../interfaces/rating-form-props.interface";
import styles from "../dashboard.module.css";

const SCORES = [1, 2, 3, 4, 5] as const;

export default function RatingForm({ item }: RatingFormProps) {
  const [saved, setSaved] = useState<number | null>(item.collector_rating);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (item.status !== "completed" || !item.collector) return null;
  if (saved !== null) return <p className={styles.statusText}>Rating Anda: {saved} dari 5</p>;

  async function save() {
    setError("");
    setBusy(true);
    const result = await rateCollectorAction({ submissionId: item.id, rating, review });
    setBusy(false);
    if (result.success) setSaved(rating);
    else setError(result.error ?? "Rating belum tersimpan.");
  }

  return (
    <section className={styles.ratingForm} aria-labelledby="rating-title">
      <span id="rating-title" className={styles.detailLabel}>Beri rating pengepul</span>
      <div className={styles.ratingScores} role="group" aria-label="Rating 1 sampai 5">
        {SCORES.map(score => (
          <button
            key={score}
            type="button"
            className={styles.ratingScore}
            aria-pressed={rating === score}
            aria-label={`${score} dari 5`}
            onClick={() => setRating(score)}
            disabled={busy}
          >
            {score}
          </button>
        ))}
      </div>
      <textarea
        className={styles.textArea}
        rows={2}
        maxLength={500}
        placeholder="Ulasan (opsional)"
        value={review}
        aria-label="Ulasan"
        disabled={busy}
        onChange={event => setReview(event.target.value)}
      />
      <button type="button" className={styles.primaryActionButton} onClick={save} disabled={busy || rating === 0}>
        {busy ? "Menyimpan..." : "Simpan rating"}
      </button>
      {error && <p className={styles.fieldErrorText} role="alert">{error}</p>}
    </section>
  );
}
