"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPickerProps } from "../interfaces/map-picker-props.interface";
import { getTileSource } from "../providers/tiles";
import styles from "../location.module.css";

export default function LeafletMap({ coordinates, disabled, onSelect }: MapPickerProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const latest = useRef({ disabled, onSelect });
  const [tileError, setTileError] = useState(false);
  const source = getTileSource();
  useEffect(() => { latest.current = { disabled, onSelect }; }, [disabled, onSelect]);

  useEffect(() => {
    const tiles = getTileSource();
    if (!container.current || !tiles) return;
    const instance = L.map(container.current, { scrollWheelZoom: false, attributionControl: true }).setView([-2.5, 118], 4);
    map.current = instance;
    instance.attributionControl.setPrefix('<a href="https://leafletjs.com/">Leaflet</a>');
    L.tileLayer(tiles.url, { attribution: tiles.attribution, maxZoom: tiles.maxZoom }).addTo(instance)
      .on("tileerror", () => setTileError(true));
    instance.on("click", (event: L.LeafletMouseEvent) => {
      if (!latest.current.disabled) latest.current.onSelect({ latitude: event.latlng.lat, longitude: event.latlng.wrap().lng });
    });
    const resize = new ResizeObserver(() => instance.invalidateSize());
    resize.observe(container.current);
    return () => { resize.disconnect(); instance.remove(); map.current = null; marker.current = null; };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !coordinates) return;
    const point: L.LatLngExpression = [coordinates.latitude, coordinates.longitude];
    if (!marker.current) {
      marker.current = L.marker(point, {
        draggable: !disabled, title: "Titik penjemputan", alt: "Titik penjemputan",
        icon: L.divIcon({ className: styles.pin, html: '<span></span>', iconSize: [44, 44], iconAnchor: [22, 22] }),
      }).addTo(instance).on("dragend", () => {
        const next = marker.current?.getLatLng();
        if (next && !latest.current.disabled) latest.current.onSelect({ latitude: next.lat, longitude: next.wrap().lng });
      });
    } else marker.current.setLatLng(point);
    if (disabled) marker.current.dragging?.disable(); else marker.current.dragging?.enable();
    instance.setView(point, Math.max(instance.getZoom(), 16), { animate: false });
  }, [coordinates, disabled]);

  if (!source) return <p className={styles.error} role="status">Peta belum dikonfigurasi. Pengelola perlu mengisi key peta Geoapify.</p>;
  return <>
    <div ref={container} className={styles.map} aria-label="Peta lokasi penjemputan" />
    {tileError && <p className={styles.error} role="alert">Gambar peta gagal dimuat. Periksa koneksi atau konfigurasi key peta.</p>}
    <button type="button" className={styles.secondary} disabled={disabled || tileError} onClick={() => {
      const point = map.current?.getCenter();
      if (point) onSelect({ latitude: point.lat, longitude: point.wrap().lng });
    }}>Pilih titik di tengah peta</button>
  </>;
}
