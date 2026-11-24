import styles from "../collector.module.css";

export default function InvalidLink() {
  return (
    <div className={styles.column}>
      <section className={styles.card}>
        <h1 className={styles.jobTitle}>Link tidak berlaku</h1>
        <p className={styles.muted}>Minta link baru ke tim Kasitronik.</p>
      </section>
    </div>
  );
}
