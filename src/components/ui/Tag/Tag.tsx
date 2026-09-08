import type { CSSProperties } from 'react';
import type { CategoricalColor } from '@/utils';
import styles from './Tag.module.scss';

interface TagProps {
  label: string;
  onRemove?: () => void;
  /** Slot de la paleta categórica (p. ej. chips de género). Por defecto el 1. */
  color?: CategoricalColor;
  /** Texto con el color de texto principal en oscuro, en vez del color categórico. */
  strongText?: boolean;
  /** Escala tipográfica: `sm` (chip compacto, por defecto) o `md` (tamaño del cuerpo de texto). */
  size?: 'sm' | 'md';
}

export function Tag({
  label,
  onRemove,
  color = 1,
  strongText = false,
  size = 'sm',
}: TagProps) {
  const colorStyle = { '--tag-c': `var(--cat-${color})` } as CSSProperties;
  const className = [styles.tag, strongText && styles.strongText, size === 'md' && styles.md]
    .filter(Boolean)
    .join(' ');

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
