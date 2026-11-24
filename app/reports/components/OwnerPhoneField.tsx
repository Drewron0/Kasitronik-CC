import type { OwnerPhoneFieldProps } from "../interfaces/owner-phone-field-props.interface";
import styles from "../reports.module.css";

export default function OwnerPhoneField({ value, error, disabled, onChange }: OwnerPhoneFieldProps) {
  return (
    <div className={styles.phoneField}>
      <label htmlFor="ownerPhone">Nomor WhatsApp</label>
      <input
        id="ownerPhone"
        name="ownerPhone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="0812 3456 7890"
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "ownerPhone-error" : undefined}
        required
        onChange={event => onChange(event.target.value)}
      />
      {error && <p id="ownerPhone-error" className={styles.fieldError} role="alert">{error}</p>}
    </div>
  );
}
