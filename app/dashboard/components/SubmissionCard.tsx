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
}

export default function SubmissionCard({
  item,
  onClick,
}: SubmissionCardProps) {
  const [imgError, setImgError] = useState(false);

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
      </div>
    </article>
  );
}
