import type { CSSProperties } from 'react';
import type { CategoricalColor } from '@/utils';
import styles from './Tag.module.scss';

interface TagProps {
  label: string;
  onRemove?: () => void;
  /** Color categórico decorativo (p. ej. chips de género). Por defecto `primary`. */
  color?: CategoricalColor;
  /** Texto con el color de texto principal en oscuro, en vez del color categórico. */
  strongText?: boolean;
}

export function Tag({ label, onRemove, color = 'primary', strongText = false }: TagProps) {
  const colorStyle = { '--tag-c': `var(--color-${color})` } as CSSProperties;
  const className = strongText ? `${styles.tag} ${styles.strongText}` : styles.tag;

  return (
    <span className={className} style={colorStyle}>
      {label}
      {onRemove && (
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={`Quitar ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
