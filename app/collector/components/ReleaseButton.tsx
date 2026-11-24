"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { releaseHeldJob } from "../actions/release.action";
import type { JobActionProps } from "../interfaces/job-action-props.interface";
import styles from "../collector.module.css";

export default function ReleaseButton({ jobRef }: JobActionProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function release() {
    setError("");
    startTransition(async () => {
      const result = await releaseHeldJob(jobRef);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  if (!confirming) {
    return <button type="button" className={styles.textButton} onClick={() => setConfirming(true)}>Lepas laporan</button>;
  }
  return (
    <div className={styles.form}>
      <p className={styles.muted}>Laporan akan ditawarkan ke pengepul lain.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.secondaryButton} onClick={release} disabled={pending}>
          {pending ? "Melepas..." : "Ya, lepas laporan"}
        </button>
        <button type="button" className={styles.textButton} onClick={() => setConfirming(false)} disabled={pending}>Batal</button>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
