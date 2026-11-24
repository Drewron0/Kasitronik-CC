import type { CollectorHomeProps } from "../interfaces/collector-home-props.interface";
import JobCard from "./JobCard";
import EnablePushButton from "./EnablePushButton";
import PauseToggle from "./PauseToggle";
import NotifyModeSwitch from "./NotifyModeSwitch";
import AreaEditor from "./AreaEditor";
import styles from "../collector.module.css";

export default function CollectorHome({ collector, held, open, pushDevices, vapidPublicKey }: CollectorHomeProps) {
  const jobHref = (id: string) => `/p/kerja/${id}`;
  return (
    <div className={styles.column}>
      <div className={styles.heading}>
        <h1>Halo, {collector.name}</h1>
        <PauseToggle paused={collector.paused} />
      </div>

      <section className={styles.card} aria-labelledby="push-heading">
        <h2 id="push-heading" className={styles.jobTitle}>Notifikasi</h2>
        <EnablePushButton vapidPublicKey={vapidPublicKey} hasDevices={pushDevices > 0} />
        <NotifyModeSwitch mode={collector.notifyMode} />
      </section>

      {held.length > 0 && (
        <section className={styles.section} aria-labelledby="held-heading">
          <h2 id="held-heading">Sedang Anda pegang</h2>
          <ul className={styles.jobList}>
            {held.map(item => <JobCard key={item.job.submissionId} job={item.job} photoUrl={item.photoUrl} href={jobHref(item.job.submissionId)} />)}
          </ul>
        </section>
      )}

      <section className={styles.section} aria-labelledby="open-heading">
        <h2 id="open-heading">Laporan terbuka di wilayah Anda</h2>
        {open.length
          ? <ul className={styles.jobList}>{open.map(item => <JobCard key={item.job.submissionId} job={item.job} photoUrl={item.photoUrl} href={jobHref(item.job.submissionId)} />)}</ul>
          : <p className={styles.muted}>Belum ada laporan terbuka.</p>}
      </section>

      <section className={styles.card} aria-labelledby="area-heading">
        <h2 id="area-heading" className={styles.jobTitle}>Wilayah jemput</h2>
        <AreaEditor areas={collector.areas} />
      </section>
    </div>
  );
}
