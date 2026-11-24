"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AreaListField from "@/app/location/components/AreaListField";
import type { CollectorArea } from "@/lib/collector/interfaces/collector-area.interface";
import { saveAreas } from "../actions/settings.action";
import type { AreaEditorProps } from "../interfaces/area-editor-props.interface";
import styles from "../collector.module.css";

export default function AreaEditor({ areas: initial }: AreaEditorProps) {
  const router = useRouter();
  const [areas, setAreas] = useState<CollectorArea[]>(initial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setError("");
    startTransition(async () => {
      const result = await saveAreas(areas);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className={styles.form}>
      <AreaListField value={areas} disabled={pending} onChange={next => { setAreas(next); setSaved(false); }} />
      <button type="button" className={styles.primaryButton} onClick={save} disabled={pending || areas.length === 0}>
        {pending ? "Menyimpan..." : "Simpan wilayah"}
      </button>
      {saved && <p className={styles.status} role="status">Wilayah tersimpan.</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
