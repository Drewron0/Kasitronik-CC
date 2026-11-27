"use client";

import { useState } from "react";
import Image from "next/image";
import type { SubmissionItem } from "../interfaces/submission-item.interface";
import { formatCategory, formatDate } from "../utils/formatters";
import StatusStepper from "./StatusStepper";
import styles from "../dashboard.module.css";

interface SubmissionCardProps {
  item: SubmissionItem;
  onClick: (item: SubmissionItem) => void;
  onCancel: (item: SubmissionItem) => void;
}

export default function SubmissionCard({
  item,
  onClick,
  onCancel,
}: SubmissionCardProps) {
  const [imgError, setImgError] = useState(false);
  const canCancel = item.status === "pending" || item.status === "accepted";

  return (
    <article
      className={styles.card}
      onClick={() => onClick(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(item);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Lihat detail laporan untuk ${item.item_name}`}
    >
      <div className={styles.cardMain}>
        {/* Gambar Thumbnail Besar */}
        <div className={styles.cardThumbnail}>
          {item.photo_url && !imgError ? (
            <Image
              src={item.photo_url}
              alt={item.item_name}
              fill
              className={styles.thumbnailImage}
              sizes="(max-width: 640px) 100vw, 136px"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.thumbnailPlaceholder} aria-hidden="true">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
          )}
        </div>

        {/* Content: Kategori, Tanggal, Nama, Timeline Status */}
        <div className={styles.cardContent}>
          <div className={styles.cardMetaRow}>
            <span className={styles.categoryText}>
              {formatCategory(item.category)}
            </span>
            <span className={styles.metaDivider} aria-hidden="true">
              •
            </span>
            <time className={styles.dateLabel} dateTime={item.created_at}>
              {formatDate(item.created_at)}
            </time>
          </div>

          <h3 className={styles.cardTitle}>{item.item_name}</h3>

          {/* Timeline Status */}
          <div className={styles.cardTimeline}>
            <StatusStepper status={item.status} />
          </div>

          {/* Informasi Pengepul & Rating */}
          {item.collector && (item.status === "accepted" || item.status === "completed") ? (
            <div className={styles.cardCollectorRow}>
              <span className={styles.collectorTypeBadge}>Mitra Pengepul</span>
              <span className={styles.cardCollectorName}>{item.collector.name}</span>
              <span className={styles.metaDivider} aria-hidden="true">•</span>
              <span className={styles.collectorRatingInline}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>
                  {item.collector.rating !== null
                    ? `${item.collector.rating.toFixed(1).replace(".", ",")}/5`
                    : "Baru"}
                </span>
              </span>
              {item.status === "completed" && item.collector_rating !== null ? (
                <>
                  <span className={styles.metaDivider} aria-hidden="true">•</span>
                  <span className={styles.cardOwnerRating}>Rating Anda: {item.collector_rating}/5</span>
                </>
              ) : null}
            </div>
          ) : item.status === "pending" ? (
            <div className={styles.cardCollectorPending}>
              <span>Mitra Pengepul: Menunggu penjemput terdekat</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Card Actions di Bawah */}
      <div className={styles.cardActions}>
        {canCancel && (
          <button
            type="button"
            className={`${styles.actionButton} ${styles.cancelButton}`}
            onClick={(e) => {
              e.stopPropagation();
              onCancel(item);
            }}
            aria-label={`Batalkan laporan ${item.item_name}`}
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
            <span>Batalkan</span>
          </button>
        )}

        <button
          type="button"
          className={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation();
            onClick(item);
          }}
          aria-label={`Lihat detail laporan ${item.item_name}`}
        >
          <span>Lihat Detail</span>
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
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </article>
  );
}
