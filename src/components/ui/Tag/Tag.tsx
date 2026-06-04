import styles from './Tag.module.scss';

interface TagProps {
  label: string;
  onRemove?: () => void;
}

export function Tag({ label, onRemove }: TagProps) {
  return (
    <span className={styles.tag}>
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
