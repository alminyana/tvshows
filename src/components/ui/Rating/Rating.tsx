import { useState } from 'react';
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
  const [hovered, setHovered] = useState<number | null>(null);

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

  // Durante el hover se previsualiza el relleno hasta la estrella apuntada;
  // sin hover se refleja el valor seleccionado real.
  const displayValue = hovered ?? value;

  return (
    <fieldset className={styles.fieldset}>
      <legend className="sr-only">{label}</legend>
      <div className={styles.row} onMouseLeave={() => setHovered(null)}>
        {stars.map((star) => (
          <label key={star} className={styles.starLabel} onMouseEnter={() => setHovered(star)}>
            <input
              type="radio"
              name={label}
              value={star}
              checked={star === value}
              onChange={() => onChange?.(star)}
              className="sr-only"
            />
            <span className={star <= displayValue ? styles.filled : styles.empty} aria-hidden="true">★</span>
            <span className="sr-only">{star}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
