"use client";

import { useState } from "react";
import Image from "next/image";
import type { SubmissionItem } from "../interfaces/submission-item.interface";
import { formatCategory, formatDate, formatStatus } from "../utils/formatters";
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
      {/* 1. Gambar */}
      <div className={styles.cardThumbnail}>
        {item.photo_url && !imgError ? (
          <Image
            src={item.photo_url}
            alt={item.item_name}
            fill
            className={styles.thumbnailImage}
            sizes="(max-width: 640px) 68px, 80px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.thumbnailPlaceholder} aria-hidden="true">
            <svg
              width="24"
              height="24"
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

      {/* Content: Kategori, Tanggal, Nama, Status */}
      <div className={styles.cardContent}>
        <div className={styles.cardTopRow}>
          {/* 2. Kategori */}
          <span className={styles.categoryBadge}>
            {formatCategory(item.category)}
          </span>
          {/* 3. Tanggal */}
          <time className={styles.dateLabel} dateTime={item.created_at}>
            {formatDate(item.created_at)}
          </time>
        </div>

        {/* 4. Nama */}
        <h3 className={styles.cardTitle}>{item.item_name}</h3>

        {/* 5. Status */}
        <div className={styles.cardBottomRow}>
          <span className={`${styles.statusBadge} ${styles[`status_${item.status}`]}`}>
            <span className={styles.statusDot} aria-hidden="true" />
            {formatStatus(item.status)}
          </span>
          <span className={styles.cardChevron} aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
}
