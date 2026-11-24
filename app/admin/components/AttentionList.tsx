"use client";

import { useState } from "react";
import { formatDate } from "@/app/dashboard/utils/formatters";
import { adminRequest } from "../actions/admin-request";
import type { AttentionListProps } from "../interfaces/attention-list-props.interface";
import styles from "../admin.module.css";

export default function AttentionList({ data, onChanged }: AttentionListProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function resolve(id: string) {
    setError("");
    setBusyId(id);
    const result = await adminRequest(`/api/admin/problems/${encodeURIComponent(id)}`, "PATCH");
    setBusyId(null);
    if (!result.ok) setError(result.error);
    else onChanged();
  }

  if (!data.unclaimed.length && !data.problems.length) return <p className={styles.muted}>Tidak ada yang perlu ditangani.</p>;

  return (
    <>
      {error && <p className={styles.fieldError} role="alert">{error}</p>}
      {data.unclaimed.length > 0 && (
        <section className={styles.section} aria-labelledby="unclaimed-heading">
          <h3 id="unclaimed-heading" className={styles.subheading}>Belum terambil</h3>
          <ul className={styles.list}>
            {data.unclaimed.map(report => (
              <li key={report.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.rowTitle}>{report.quantity}x {report.itemName}</span>
                  <span className={styles.muted}>{report.district || report.address} - {formatDate(report.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      {data.problems.length > 0 && (
        <section className={styles.section} aria-labelledby="problems-heading">
          <h3 id="problems-heading" className={styles.subheading}>Laporan masalah</h3>
          <ul className={styles.list}>
            {data.problems.map(problem => (
              <li key={problem.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.rowTitle}>{problem.message}</span>
                  <span className={styles.muted}>{formatDate(problem.createdAt)} - laporan {problem.submissionId.slice(0, 8)}</span>
                </div>
                <div className={styles.rowActions}>
                  <button type="button" className={styles.secondaryButton} disabled={busyId === problem.id} onClick={() => resolve(problem.id)}>
                    Tandai selesai
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
