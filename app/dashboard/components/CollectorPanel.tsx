import { formatPhoneDisplay, formatRating, waLink } from "@/lib/notifications/format";
import type { CollectorPanelProps } from "../interfaces/collector-panel-props.interface";
import styles from "../dashboard.module.css";

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/** Who is coming, collector type/status, rating, and the handover code while the pickup is open. */
export default function CollectorPanel({ item }: CollectorPanelProps) {
  const { collector } = item;
  if (!collector || (item.status !== "accepted" && item.status !== "completed")) return null;

  const pickupStatusLabel = item.status === "accepted" ? "Akan menjemput" : "Penjemputan selesai";
  const ratingText =
    collector.rating === null
      ? "Belum ada rating"
      : `${collector.rating.toFixed(1).replace(".", ",")} / 5`;

  return (
    <section className={styles.collectorPanel} aria-label="Informasi Pengepul">
      <div className={styles.collectorBadges}>
        <span className={styles.collectorTypeBadge}>Mitra Pengepul</span>
        <span className={styles.collectorStatusPill}>{pickupStatusLabel}</span>
        <span className={styles.collectorRatingPill} title={formatRating(collector.rating)}>
          <StarIcon />
          <span>{ratingText}</span>
        </span>
      </div>

      <div className={styles.collectorRow}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Pengepul yang datang</span>
          <span className={styles.detailValue}>{collector.name}</span>
          <span className={styles.collectorMeta}>
            {formatPhoneDisplay(collector.phone)} - {collector.completedJobs} penjemputan selesai
          </span>
        </div>
        <a href={waLink(collector.phone)} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
          Chat pengepul
        </a>
      </div>

      {item.status === "accepted" && item.handover_code ? (
        <div className={styles.handoverCard}>
          <span className={styles.detailLabel}>Kode serah terima</span>
          <span className={styles.handoverCode}>{item.handover_code}</span>
        </div>
      ) : null}
    </section>
  );
}
