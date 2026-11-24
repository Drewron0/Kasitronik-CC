import { formatPhoneDisplay, formatRating, waLink } from "@/lib/notifications/format";
import type { CollectorPanelProps } from "../interfaces/collector-panel-props.interface";
import styles from "../dashboard.module.css";

/** Who is coming, how to reach them, and the handover code while the pickup is open. */
export default function CollectorPanel({ item }: CollectorPanelProps) {
  const { collector } = item;
  if (!collector || (item.status !== "accepted" && item.status !== "completed")) return null;
  return (
    <section className={styles.collectorPanel} aria-label="Pengepul">
      <div className={styles.collectorRow}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Pengepul</span>
          <span className={styles.detailValue}>{collector.name}</span>
          <span className={styles.collectorMeta}>
            {formatPhoneDisplay(collector.phone)} - {formatRating(collector.rating)} - {collector.completedJobs} penjemputan selesai
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
          <span className={styles.collectorMeta}>Berikan kode ini saat barang diserahkan.</span>
        </div>
      ) : null}
    </section>
  );
}
