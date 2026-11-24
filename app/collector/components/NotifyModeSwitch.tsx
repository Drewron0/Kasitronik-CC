"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { NotifyMode } from "@/lib/collector/interfaces/notify-mode.type";
import { setNotifyMode } from "../actions/settings.action";
import type { NotifyModeSwitchProps } from "../interfaces/notify-mode-switch-props.interface";
import styles from "../collector.module.css";

const OPTIONS = [
  { mode: "instant", label: "Langsung" },
  { mode: "digest", label: "Rangkuman 2x sehari" },
] as const;

export default function NotifyModeSwitch({ mode }: NotifyModeSwitchProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function choose(next: NotifyMode) {
    if (next === mode) return;
    setError("");
    startTransition(async () => {
      const result = await setNotifyMode(next);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className={styles.form}>
      <div className={styles.segmented} role="group" aria-label="Cara menerima laporan">
        {OPTIONS.map(option => (
          <button key={option.mode} type="button" aria-pressed={option.mode === mode} disabled={pending} onClick={() => choose(option.mode)}>
            {option.label}
          </button>
        ))}
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
