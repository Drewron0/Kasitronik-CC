import styles from "../login.module.css";

export default function LoginIntro() {
  return (
    <section className={styles.introduction}>
      <p className={styles.eyebrow}>KASITRONIK</p>

      <h1>
        Elektronik lama.
        <br />
        <span>Langkah baru.</span>
      </h1>

      <p className={styles.description}>
        Masuk untuk mengelola laporan elektronik dan memantau proses penjemputan.
      </p>
    </section>
  );
}
