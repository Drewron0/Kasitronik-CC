"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPaused } from "../actions/settings.action";
import type { PauseToggleProps } from "../interfaces/pause-toggle-props.interface";
import styles from "../collector.module.css";

export default function PauseToggle({ paused }: PauseToggleProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle() {
    setError("");
    startTransition(async () => {
      const result = await setPaused(!paused);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className={styles.form}>
      <div className={styles.toggleRow}>
        <p className={paused ? styles.muted : styles.status} role="status">
          {paused ? "Dijeda: tidak menerima laporan baru" : "Aktif menerima laporan"}
        </p>
        <button type="button" className={styles.secondaryButton} onClick={toggle} disabled={pending}>
          {paused ? "Aktifkan" : "Jeda"}
        </button>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
