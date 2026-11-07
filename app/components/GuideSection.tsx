import styles from "../page.module.css";

export default function GuideSection() {
  return (
    <section className={styles.guide} id="kategori" aria-labelledby="guide-title">
      <div className={styles.guideHeader}>
        <span className={styles.eyebrow}>PANDUAN PERANGKAT</span>
      </div>

      <h2 id="guide-title">Kategori yang diterima</h2>

      <ul className={styles.itemList}>
        <li>
          <span className={styles.itemNumber}>01</span>
          <div>
            <strong>Ponsel & tablet</strong>
            <span>Perangkat lawas, mati total, atau layar retak</span>
          </div>
        </li>
        <li>
          <span className={styles.itemNumber}>02</span>
          <div>
            <strong>Komputer & laptop</strong>
            <span>Unit PC, laptop, monitor, dan adaptor</span>
          </div>
        </li>
        <li>
          <span className={styles.itemNumber}>03</span>
          <div>
            <strong>Kabel & periferal</strong>
            <span>Pengisi daya, kabel data, serta aksesori elektronik</span>
          </div>
        </li>
      </ul>
    </section>
  );
}
