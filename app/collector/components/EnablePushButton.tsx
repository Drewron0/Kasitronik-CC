"use client";

import { useEffect, useState } from "react";
import { subscribePush } from "../actions/push-subscribe.action";
import type { EnablePushProps } from "../interfaces/enable-push-props.interface";
import type { PushState } from "../interfaces/push-state.type";
import { vapidKeyToBytes } from "../push-key";
import styles from "../collector.module.css";

function detect(): PushState {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (ios && !standalone) return "ios-install";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "blocked";
  return "ready";
}

export default function EnablePushButton({ vapidPublicKey, hasDevices }: EnablePushProps) {
  const [state, setState] = useState<PushState>("checking");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      let next = detect();
      if (next === "ready") {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
          next = (await registration.pushManager.getSubscription()) ? "on" : "ready";
        } catch {
          next = "unsupported";
        }
      }
      if (active) setState(next);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function enable() {
    setError("");
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "ready");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKeyToBytes(vapidPublicKey) });
      const json = subscription.toJSON();
      const result = await subscribePush({ endpoint: subscription.endpoint, keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" } });
      if (result.ok) setState("on");
      else setError(result.error);
    } catch {
      setError("Notifikasi belum bisa diaktifkan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "checking") return null;
  if (state === "on") return <p className={styles.status} role="status">Notifikasi aktif di HP ini.</p>;
  if (state === "ios-install") {
    return <p className={styles.muted}>Di iPhone: ketuk tombol Bagikan, pilih Tambahkan ke Layar Utama, lalu buka Kasitronik dari layar utama untuk mengaktifkan notifikasi.</p>;
  }
  if (state === "blocked") return <p className={styles.error}>Notifikasi diblokir. Izinkan notifikasi untuk situs ini di pengaturan browser.</p>;
  if (state === "unsupported") return <p className={styles.error}>Browser ini belum mendukung notifikasi. Gunakan Chrome di Android.</p>;
  return (
    <div className={styles.form}>
      <button type="button" className={styles.primaryButton} onClick={enable} disabled={busy || !vapidPublicKey}>
        {busy ? "Mengaktifkan..." : hasDevices ? "Aktifkan di HP ini juga" : "Aktifkan notifikasi"}
      </button>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
