"use client";

import { useState } from "react";
import MapPicker from "./MapPicker";
import type { Coordinates } from "../interfaces/coordinates.interface";
import type { AreaListFieldProps } from "../interfaces/area-list-field-props.interface";
import { MAX_AREAS, RADIUS_MAX_KM, RADIUS_MIN_KM } from "@/lib/collector/rules";
import styles from "../location.module.css";

const DEFAULT_RADIUS = "5";

/** Pick up to MAX_AREAS circles (map point + radius) for where a collector picks up. */
export default function AreaListField({ value, disabled, onChange }: AreaListFieldProps) {
  const [point, setPoint] = useState<Coordinates | null>(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const radiusValue = Number(radius);
  const radiusValid = Number.isFinite(radiusValue) && radiusValue >= RADIUS_MIN_KM && radiusValue <= RADIUS_MAX_KM;

  function add() {
    if (!point || !radiusValid || value.length >= MAX_AREAS) return;
    onChange([...value, { ...point, radiusKm: radiusValue }]);
    setPoint(null);
  }

  return (
    <div className={styles.areaField}>
      {value.length > 0 && (
        <ul className={styles.areaList}>
          {value.map((area, index) => (
            <li key={`${area.latitude},${area.longitude},${index}`} className={styles.areaItem}>
              <span>Wilayah {index + 1}: radius {area.radiusKm} km dari {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}</span>
              <button type="button" className={styles.areaRemove} disabled={disabled} onClick={() => onChange(value.filter((_, i) => i !== index))}>
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
      {value.length < MAX_AREAS && (
        <>
          <MapPicker coordinates={point} disabled={disabled} onSelect={setPoint} />
          <div className={styles.areaAddRow}>
            <label className={styles.areaRadius}>
              Radius (km)
              <input
                type="number"
                inputMode="numeric"
                min={RADIUS_MIN_KM}
                max={RADIUS_MAX_KM}
                value={radius}
                disabled={disabled}
                aria-invalid={!radiusValid}
                onChange={event => setRadius(event.target.value)}
              />
            </label>
            <button type="button" className={styles.areaAdd} onClick={add} disabled={disabled || !point || !radiusValid}>
              Tambah wilayah
            </button>
          </div>
          {!radiusValid && <p className={styles.areaError}>Radius {RADIUS_MIN_KM}-{RADIUS_MAX_KM} km.</p>}
        </>
      )}
    </div>
  );
}
