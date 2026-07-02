import type { CSSProperties } from 'react';
import type { CategoricalColor } from '@/utils';
import styles from './Tag.module.scss';

interface TagProps {
  label: string;
  onRemove?: () => void;
  /** Color categórico decorativo (p. ej. chips de género). Por defecto `primary`. */
  color?: CategoricalColor;
}

export function Tag({ label, onRemove, color = 'primary' }: TagProps) {
  const colorStyle = { '--tag-c': `var(--color-${color})` } as CSSProperties;

  return (
    <span className={styles.tag} style={colorStyle}>
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
