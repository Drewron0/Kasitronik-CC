import styles from "../../login/login.module.css";

export default function RegisterIntro() {
  return (
    <section className={styles.introduction}>
      <p className={styles.eyebrow}>KASITRONIK</p>

      <h1>
        Ruang lebih lega.
        <br />
        <span>Barang lebih berguna.</span>
      </h1>
    </section>
  );
}
