import styles from "../page.module.css";

export default function WorkflowSection() {
  return (
    <section
      id="alur"
      className={styles.workflow}
      aria-labelledby="workflow-title"
    >
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}>ALUR PROSES</p>
        <h2 id="workflow-title">Dari laporan hingga serah terima</h2>
        <p>Langkah transparan dari penyerahan hingga pemrosesan.</p>
      </div>

      <ol className={styles.steps}>
        <li>
          <span className={styles.stepNumber}>01</span>
          <h3>Laporkan barang</h3>
          <p>Isi rincian unit, foto kondisi, dan lokasi penjemputan.</p>
        </li>
        <li>
          <span className={styles.stepNumber}>02</span>
          <h3>Verifikasi data</h3>
          <p>Laporan divalidasi sebelum diteruskan ke mitra pengepul.</p>
        </li>
        <li>
          <span className={styles.stepNumber}>03</span>
          <h3>Jadwalkan jemput</h3>
          <p>Mitra berkoordinasi langsung untuk waktu penjemputan.</p>
        </li>
        <li>
          <span className={styles.stepNumber}>04</span>
          <h3>Konfirmasi selesai</h3>
          <p>Status diperbarui setelah barang berhasil diserahterimakan.</p>
        </li>
      </ol>
    </section>
  );
}
