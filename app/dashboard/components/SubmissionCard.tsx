"use client";

import Image from "next/image";
import type { SubmissionItem } from "../interfaces/submission-item.interface";
import { formatCategory, formatCondition, formatDate, formatWeight } from "../utils/formatters";
import StatusStepper from "./StatusStepper";
import styles from "../dashboard.module.css";

interface SubmissionCardProps {
  item: SubmissionItem;
  onViewDetail: (item: SubmissionItem) => void;
  onCancel: (item: SubmissionItem) => void;
}

export default function SubmissionCard({
  item,
  onViewDetail,
  onCancel,
}: SubmissionCardProps) {
  const isPending = item.status === "pending";

  return (
    <article className={styles.card} aria-labelledby={`card-title-${item.id}`}>
      <div className={styles.cardMain}>
        {/* Thumbnail */}
        <div className={styles.cardThumbnail}>
          {item.photo_url ? (
            <Image
              src={item.photo_url}
              alt={item.item_name}
              fill
              className={styles.thumbnailImage}
              sizes="(max-width: 640px) 100vw, 108px"
            />
          ) : (
            <div className={styles.thumbnailPlaceholder} aria-hidden="true">
              <svg
                width="32"
                height="32"
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

        {/* Content Body */}
        <div className={styles.cardBody}>
          <div className={styles.cardMetaRow}>
            <span className={styles.categoryBadge}>
              {formatCategory(item.category)}
            </span>
            <span className={styles.conditionBadge}>
              {formatCondition(item.condition)}
            </span>
            <time className={styles.dateLabel} dateTime={item.created_at}>
              {formatDate(item.created_at)}
            </time>
          </div>

          <h3 id={`card-title-${item.id}`} className={styles.cardTitle}>
            {item.item_name}
          </h3>

          <p className={styles.cardSubtitle}>
            {item.brand_model ? `${item.brand_model} • ` : ""}
            {item.quantity} Unit • {formatWeight(item)}
          </p>

          {item.pickup_address ? (
            <div className={styles.addressRow}>
              <svg
                className={styles.addressIcon}
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
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{item.pickup_address}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Stepper */}
      <div className={styles.stepperContainer}>
        <StatusStepper status={item.status} />
      </div>

      {/* Card Actions */}
      <div className={styles.cardActions}>
        {isPending ? (
          <button
            type="button"
            className={`${styles.actionButton} ${styles.cancelButton}`}
            onClick={() => onCancel(item)}
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
        ) : null}

        <button
          type="button"
          className={styles.actionButton}
          onClick={() => onViewDetail(item)}
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
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Lihat Detail</span>
        </button>
      </div>
    </article>
  );
}
