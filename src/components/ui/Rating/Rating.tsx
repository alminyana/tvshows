import styles from './Rating.module.scss';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  label?: string;
}

export function Rating({ value, onChange, max = 5, readOnly = false, label = 'Valoración' }: RatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  if (readOnly) {
    return (
      <span className={styles.row} aria-label={`${label}: ${value} de ${max}`}>
        {stars.map((star) => (
          <span key={star} className={star <= value ? styles.filled : styles.empty} aria-hidden="true">
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <fieldset className={styles.fieldset}>
      <legend className="sr-only">{label}</legend>
      <div className={styles.row}>
        {stars.map((star) => (
          <label key={star} className={styles.starLabel}>
            <input
              type="radio"
              name={label}
              value={star}
              checked={star === value}
              onChange={() => onChange?.(star)}
              className="sr-only"
            />
            <span className={star <= value ? styles.filled : styles.empty} aria-hidden="true">★</span>
            <span className="sr-only">{star}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
