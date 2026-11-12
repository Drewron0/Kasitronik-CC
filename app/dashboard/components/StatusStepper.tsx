import type { SubmissionStatus } from "../interfaces/submission-status.type";
import { STATUS_LABELS } from "../utils/formatters";
import styles from "../dashboard.module.css";

interface StatusStepperProps {
  status: SubmissionStatus;
}

const STEPS: { key: SubmissionStatus; label: string; stepNumber: number }[] = [
  { key: "pending", label: STATUS_LABELS.pending, stepNumber: 1 },
  { key: "accepted", label: STATUS_LABELS.accepted, stepNumber: 2 },
  { key: "picked_up", label: STATUS_LABELS.picked_up, stepNumber: 3 },
  { key: "completed", label: STATUS_LABELS.completed, stepNumber: 4 },
];

function getStepIndex(status: SubmissionStatus): number {
  switch (status) {
    case "pending":
      return 0;
    case "accepted":
      return 1;
    case "picked_up":
      return 2;
    case "completed":
      return 3;
    default:
      return -1;
  }
}

export default function StatusStepper({ status }: StatusStepperProps) {
  if (status === "cancelled") {
    return (
      <div className={styles.cancelledBanner}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <span>Laporan ini telah dibatalkan oleh pengguna.</span>
      </div>
    );
  }

  const currentIndex = getStepIndex(status);

  return (
    <div
      className={styles.stepper}
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={4}
    >
      {/* Background track line */}
      <div
        className={styles.stepLine}
        style={{
          left: "12%",
          right: "12%",
        }}
      />
      {/* Active progress fill line */}
      <div
        className={`${styles.stepLine} ${styles.stepLineDone}`}
        style={{
          left: "12%",
          width: `${(currentIndex / 3) * 76}%`,
        }}
      />

      {STEPS.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;

        return (
          <div key={step.key} className={styles.stepItem}>
            <div
              className={`${styles.stepCircle} ${
                isActive
                  ? styles.stepCircleActive
                  : isDone
                  ? styles.stepCircleDone
                  : ""
              }`}
            >
              {isDone ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step.stepNumber
              )}
            </div>
            <span
              className={`${styles.stepLabel} ${
                isActive ? styles.stepLabelActive : ""
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
