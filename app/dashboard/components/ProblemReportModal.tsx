"use client";

import { useEffect, useState, type FormEvent } from "react";
import { reportProblemAction } from "../actions/report-problem.action";
import type { ProblemReportModalProps } from "../interfaces/problem-report-modal-props.interface";
import styles from "../dashboard.module.css";

const MIN = 10;
const MAX = 1000;

export default function ProblemReportModal({ submissionId, onClose }: ProblemReportModalProps) {
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!submissionId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submissionId, busy, onClose]);

  if (!submissionId) return null;
  const id = submissionId;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError("");
    setError("");
    const text = message.trim();
    if (text.length < MIN || text.length > MAX) {
      setFieldError(`Ceritakan masalahnya dalam ${MIN}-${MAX} karakter.`);
      return;
    }
    setBusy(true);
    const result = await reportProblemAction(id, text);
    setBusy(false);
    if (result.success) setSent(true);
    else setError(result.error ?? "Laporan masalah gagal dikirim.");
  }

  return (
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="problem-title"
      onClick={event => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div className={`${styles.modal} ${styles.modalNarrow}`}>
        <div className={styles.modalHeader}>
          <h2 id="problem-title" className={styles.modalTitle}>Laporkan masalah</h2>
        </div>
        {sent ? (
          <div className={styles.modalBody}>
            <p className={styles.statusText} role="status">Laporan masalah terkirim ke tim Kasitronik.</p>
          </div>
        ) : (
          <form id="problem-form" className={styles.modalBody} onSubmit={submit} noValidate>
            <label htmlFor="problem-message" className={styles.detailLabel}>Apa yang terjadi?</label>
            <textarea
              id="problem-message"
              className={styles.textArea}
              rows={5}
              maxLength={MAX}
              value={message}
              aria-invalid={Boolean(fieldError)}
              aria-describedby={fieldError ? "problem-message-error" : undefined}
              disabled={busy}
              onChange={event => setMessage(event.target.value)}
            />
            {fieldError && <p id="problem-message-error" className={styles.fieldErrorText} role="alert">{fieldError}</p>}
            {error && <p className={styles.fieldErrorText} role="alert">{error}</p>}
          </form>
        )}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.actionButton} onClick={onClose} disabled={busy}>
            {sent ? "Tutup" : "Batal"}
          </button>
          {!sent && (
            <button type="submit" form="problem-form" className={styles.primaryActionButton} disabled={busy}>
              {busy ? "Mengirim..." : "Kirim laporan masalah"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
