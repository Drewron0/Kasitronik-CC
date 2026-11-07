import styles from "../page.module.css";

export default function PreparationSection() {
  return (
    <section
      id="persiapan"
      className={styles.preparation}
      aria-labelledby="preparation-title"
    >
      <div>
        <p className={styles.eyebrow}>PANDUAN</p>
        <h2 id="preparation-title">
          Persiapan sebelum
          <br />
          penjemputan
        </h2>
        <p className={styles.preparationIntro}>
          Ikuti langkah sederhana ini untuk memudahkan proses penyerahan barang.
        </p>
      </div>

      <div className={styles.details}>
        <details open>
          <summary>Foto kondisi perangkat</summary>
          <p>
            Ambil foto menyeluruh dan bagian yang rusak. Jangan sertakan dokumen berinformasi pribadi dalam foto.
          </p>
        </details>

        <details>
          <summary>Catat jumlah dan tipe</summary>
          <p>
            Sertakan perkiraan jumlah unit dan kondisi fungsional (masih menyala atau mati total).
          </p>
        </details>

        <details>
          <summary>Tentukan titik temu</summary>
          <p>
            Sediakan alamat penjemputan yang akurat dan patokan lokasi yang mudah diakses kurir.
          </p>
        </details>

        <details>
          <summary>Amankan data pribadi</summary>
          <p>
            Lakukan reset pabrik dan lepaskan media penyimpanan eksternal serta kartu SIM sebelum diserahkan.
          </p>
        </details>
      </div>
    </section>
  );
}
