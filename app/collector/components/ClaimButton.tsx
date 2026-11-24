"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimJob } from "../actions/claim.action";
import type { JobActionProps } from "../interfaces/job-action-props.interface";
import styles from "../collector.module.css";

export default function ClaimButton({ jobRef, afterClaimHref }: JobActionProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function claim() {
    setError("");
    startTransition(async () => {
      const result = await claimJob(jobRef);
      if (!result.ok) setError(result.error);
      if (result.ok && afterClaimHref) router.push(afterClaimHref);
      else router.refresh();
    });
  }

  return (
    <div className={styles.form}>
      <button type="button" className={styles.primaryButton} onClick={claim} disabled={pending}>
        {pending ? "Mengambil..." : "Ambil laporan"}
      </button>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
