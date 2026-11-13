"use client";

import { useEffect, useRef, useState } from "react";
import type { LocationFieldsProps } from "../interfaces/location-fields-props.interface";
import type { AddressResult } from "../interfaces/address-result.interface";
import type { Coordinates } from "../interfaces/coordinates.interface";
import { addressSearch } from "../actions/search-address";
import MapPicker from "./MapPicker";
import styles from "../location.module.css";

export default function LocationFields({ value, onChange, disabled, signedIn }: LocationFieldsProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  const latest = useRef({ value, onChange, disabled });
  useEffect(() => { latest.current = { value, onChange, disabled }; }, [value, onChange, disabled]);
  useEffect(() => () => { generation.current++; }, []);

  useEffect(() => {
    if (disabled || !signedIn || query.trim().length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true); setError(""); setMessage("");
      try {
        const found = await addressSearch.searchAddress(query.trim(), controller.signal);
        if (!controller.signal.aborted) { setResults(found); setMessage(found.length ? "Pilih alamat dari hasil pencarian." : "Alamat belum ditemukan. Coba nama jalan atau pilih titik di peta."); }
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Pencarian gagal.");
      } finally { if (!controller.signal.aborted) setSearching(false); }
    }, 600);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, disabled, signedIn]);

  function selectPoint(coordinates: Coordinates) {
    generation.current++;
    setLocating(false);
    onChange({ ...value, coordinates, confirmed: false });
  }
  function locate() {
    if (!navigator.geolocation) { setError("Browser tidak mendukung lokasi. Pilih titik secara manual."); return; }
    const request = ++generation.current;
    setLocating(true); setError("");
    navigator.geolocation.getCurrentPosition(position => {
      if (request !== generation.current) return;
      setLocating(false);
      if (latest.current.disabled) return;
      setMapOpen(true);
      latest.current.onChange({ ...latest.current.value, coordinates: { latitude: position.coords.latitude, longitude: position.coords.longitude }, confirmed: false });
      setMessage(`Lokasi ditemukan dengan perkiraan akurasi ${Math.round(position.coords.accuracy)} meter. Periksa titik penjemputan.`);
    }, () => {
      if (request !== generation.current) return;
      setLocating(false); setError("Lokasi tidak dapat diakses. Izinkan akses lokasi atau cari alamat dan pilih titik di peta.");
    }, { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 });
  }

  return <fieldset className={styles.section} disabled={disabled}>
    <legend>Lokasi penjemputan</legend>
    <label htmlFor="addressSearch">Cari jalan atau tempat</label>
    <input id="addressSearch" value={query} maxLength={200} autoComplete="off" placeholder="Contoh: nama jalan, kecamatan, kota" disabled={!signedIn} onKeyDown={event => { if (event.key === "Enter") event.preventDefault(); if (event.key === "Escape") { setQuery(""); setResults([]); setSearching(false); } }} onChange={event => { setQuery(event.target.value); setResults([]); setSearching(false); setMessage(""); setError(""); }} />
    {results.length > 0 && <ul className={styles.results} aria-label="Hasil pencarian alamat">
      {results.map((result, index) => <li key={`${result.label}-${index}`}><button type="button" onClick={() => {
        generation.current++; setLocating(false); setSearching(false); setQuery(""); setResults([]); setMapOpen(true);
        onChange({ ...value, coordinates: result.coordinates, address: result.label, confirmed: false });
        setMessage("Alamat dipilih. Periksa pin dan lengkapi nomor rumah.");
      }}>{result.label}</button></li>)}
    </ul>}
    <div className={styles.actions}>
      <button type="button" className={styles.secondary} onClick={locate} disabled={locating}>{locating ? "Mencari lokasi..." : "Gunakan lokasi saya"}</button>
      {!mapOpen && <button type="button" className={styles.secondary} onClick={() => setMapOpen(true)}>Tampilkan peta</button>}
    </div>
    {mapOpen && <MapPicker coordinates={value.coordinates} disabled={disabled} onSelect={selectPoint} />}
    {value.coordinates && <p className={styles.coordinates}>Titik dipilih: {value.coordinates.latitude.toFixed(6)}, {value.coordinates.longitude.toFixed(6)}</p>}
    <label htmlFor="pickupAddress">Alamat lengkap</label>
    <textarea id="pickupAddress" value={value.address} minLength={5} maxLength={500} rows={2} required placeholder="Jalan, nomor rumah, kelurahan, kecamatan, kota" onChange={event => onChange({ ...value, address: event.target.value, confirmed: false })} />
    <label htmlFor="pickupInstructions">Patokan / instruksi (opsional)</label>
    <input id="pickupInstructions" value={value.instructions} maxLength={500} placeholder="Contoh: gerbang depan, pagar hijau" onChange={event => onChange({ ...value, instructions: event.target.value, confirmed: false })} />
    <label className={styles.confirm}><input type="checkbox" checked={value.confirmed} disabled={!value.coordinates} onChange={event => onChange({ ...value, confirmed: event.target.checked })} />Titik dan alamat sudah sesuai untuk penjemputan.</label>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <p className={styles.status} role="status">{searching ? "Mencari alamat..." : message}</p>
    <a className={styles.attribution} href="https://www.geoapify.com/" target="_blank" rel="noreferrer">Powered by Geoapify</a>
  </fieldset>;
}
