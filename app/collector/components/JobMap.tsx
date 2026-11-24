"use client";

import MapPicker from "@/app/location/components/MapPicker";
import type { JobMapProps } from "../interfaces/job-map-props.interface";
import styles from "../collector.module.css";

/** Read-only pickup map: the existing picker with editing switched off. */
export default function JobMap({ latitude, longitude }: JobMapProps) {
  return (
    <div className={styles.map}>
      <MapPicker coordinates={{ latitude, longitude }} disabled onSelect={() => {}} />
    </div>
  );
}
