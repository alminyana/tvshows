import { useTheme } from '@/hooks';
import { MESSAGES } from '@/constants';
import styles from './ThemeToggle.module.scss';

function BulbOnIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 1 4.9 11.9c-.8.9-1.4 2-1.4 3.1H8.5c0-1.1-.6-2.2-1.4-3.1A7 7 0 0 1 12 2z" />
      <line x1="12" y1="2" x2="12" y2="0.5" />
      <line x1="4.2" y1="4.2" x2="3.1" y2="3.1" />
      <line x1="19.8" y1="4.2" x2="20.9" y2="3.1" />
    </svg>
  );
}

function BulbOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 1 4.9 11.9c-.8.9-1.4 2-1.4 3.1H8.5c0-1.1-.6-2.2-1.4-3.1A7 7 0 0 1 12 2z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { mode, toggleMode } = useTheme();
  const isLight = mode === 'light';

  return (
    <button
      className={styles.button}
      onClick={toggleMode}
      aria-label={isLight ? MESSAGES.theme.toggleToDark : MESSAGES.theme.toggleToLight}
      title={isLight ? MESSAGES.theme.toggleToDark : MESSAGES.theme.toggleToLight}
    >
      <span className={`${styles.icon} ${styles.iconOn} ${isLight ? styles.visible : styles.hidden}`}>
        <BulbOnIcon />
      </span>
      <span className={`${styles.icon} ${styles.iconOff} ${!isLight ? styles.visible : styles.hidden}`}>
        <BulbOffIcon />
      </span>
    </button>
  );
}
