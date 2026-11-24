"use client";

import { useState } from "react";
import { formatPhoneDisplay, formatRating } from "@/lib/notifications/format";
import { adminRequest } from "../actions/admin-request";
import type { CollectorListProps } from "../interfaces/collector-list-props.interface";
import CopyLinkButton from "./CopyLinkButton";
import styles from "../admin.module.css";

export default function CollectorList({ collectors, onChanged }: CollectorListProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  async function patch(id: string, body: Record<string, unknown>) {
    setError("");
    setBusyId(id);
    const result = await adminRequest<{ link?: string }>(`/api/admin/collectors/${encodeURIComponent(id)}`, "PATCH", body);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const link = result.data.link;
    if (link) setLinks(current => ({ ...current, [id]: link }));
    onChanged();
  }

  if (!collectors.length) return <p className={styles.muted}>Belum ada pengepul.</p>;

  return (
    <>
      {error && <p className={styles.fieldError} role="alert">{error}</p>}
      <ul className={styles.list}>
        {collectors.map(c => (
          <li key={c.id} className={styles.row}>
            <div className={styles.rowMain}>
              <span className={styles.rowTitle}>{c.name}</span>
              <span className={styles.muted}>
                {formatPhoneDisplay(c.phone)} - {c.areas.length} wilayah - {formatRating(c.rating)} - {c.completedJobs} selesai
              </span>
              <span className={c.pushEnabled ? styles.badge : styles.badgeWarn}>
                {!c.active ? "Nonaktif" : c.paused ? "Dijeda" : c.pushEnabled ? "Notifikasi aktif" : "Notifikasi belum aktif"}
              </span>
            </div>
            <div className={styles.rowActions}>
              <button type="button" className={styles.secondaryButton} disabled={busyId === c.id} onClick={() => patch(c.id, { resetLink: true })}>
                Buat link baru
              </button>
              <button type="button" className={styles.textButton} disabled={busyId === c.id} onClick={() => patch(c.id, { active: !c.active })}>
                {c.active ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </div>
            {links[c.id] && <CopyLinkButton link={links[c.id]} />}
          </li>
        ))}
      </ul>
    </>
  );
}
