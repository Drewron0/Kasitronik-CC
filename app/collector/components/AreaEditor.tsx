"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import MapPicker from "@/app/location/components/MapPicker";
import type { Coordinates } from "@/app/location/interfaces/coordinates.interface";
import type { CollectorArea } from "@/lib/collector/interfaces/collector-area.interface";
import { MAX_AREAS, RADIUS_MAX_KM, RADIUS_MIN_KM } from "@/lib/collector/rules";
import { saveAreas } from "../actions/settings.action";
import type { AreaEditorProps } from "../interfaces/area-editor-props.interface";
import styles from "../collector.module.css";

const DEFAULT_RADIUS = 5;
const label = (area: CollectorArea, index: number) =>
  `Wilayah ${index + 1}: radius ${area.radiusKm} km dari ${area.latitude.toFixed(4)}, ${area.longitude.toFixed(4)}`;

export default function AreaEditor({ areas: initial }: AreaEditorProps) {
  const router = useRouter();
  const [areas, setAreas] = useState<CollectorArea[]>(initial);
  const [point, setPoint] = useState<Coordinates | null>(null);
  const [radius, setRadius] = useState(String(DEFAULT_RADIUS));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const radiusValue = Number(radius);
  const radiusValid = Number.isFinite(radiusValue) && radiusValue >= RADIUS_MIN_KM && radiusValue <= RADIUS_MAX_KM;

  function add() {
    if (!point || !radiusValid || areas.length >= MAX_AREAS) return;
    setAreas([...areas, { ...point, radiusKm: radiusValue }]);
    setPoint(null);
    setSaved(false);
  }

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
      {areas.length > 0 && (
        <ul className={styles.areaList}>
          {areas.map((area, index) => (
            <li key={`${area.latitude},${area.longitude},${index}`} className={styles.areaItem}>
              <span>{label(area, index)}</span>
              <button type="button" className={styles.textButton} onClick={() => { setAreas(areas.filter((_, i) => i !== index)); setSaved(false); }}>
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
      {areas.length < MAX_AREAS && (
        <>
          <MapPicker coordinates={point} disabled={pending} onSelect={setPoint} />
          <div className={styles.radiusRow}>
            <div className={styles.field}>
              <label htmlFor="areaRadius">Radius (km)</label>
              <input
                id="areaRadius"
                type="number"
                inputMode="numeric"
                min={RADIUS_MIN_KM}
                max={RADIUS_MAX_KM}
                value={radius}
                aria-invalid={!radiusValid}
                aria-describedby={radiusValid ? undefined : "areaRadius-error"}
                onChange={event => setRadius(event.target.value)}
              />
            </div>
            <button type="button" className={styles.secondaryButton} onClick={add} disabled={!point || !radiusValid || pending}>
              Tambah wilayah
            </button>
          </div>
          {!radiusValid && <p id="areaRadius-error" className={styles.fieldError}>Radius {RADIUS_MIN_KM}-{RADIUS_MAX_KM} km.</p>}
        </>
      )}
      <button type="button" className={styles.primaryButton} onClick={save} disabled={pending || areas.length === 0}>
        {pending ? "Menyimpan..." : "Simpan wilayah"}
      </button>
      {saved && <p className={styles.status} role="status">Wilayah tersimpan.</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
