"use client";

import dynamic from "next/dynamic";
import type { MapPickerProps } from "../interfaces/map-picker-props.interface";
import styles from "../location.module.css";

const MapImplementation = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className={styles.map} role="status">Memuat peta...</div>,
});

export default function MapPicker(props: MapPickerProps) {
  return <MapImplementation {...props} />;
}
