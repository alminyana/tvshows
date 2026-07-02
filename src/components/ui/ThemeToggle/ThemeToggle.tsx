import { useTheme } from '@/hooks';
import { MESSAGES } from '@/constants';
import styles from './ThemeToggle.module.scss';

// Bombilla encendida: cristal relleno (efecto de luz) + rayos alrededor.
function LightbulbOnIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={22}
      height={22}
    >
      <circle cx="12" cy="10" r="6" fill="currentColor" fillOpacity={0.22} />
      <path d="M9.8 10.6l1.7 1.7 1.7-3.4 1.3 1.7" strokeWidth={1.3} />
      <rect x="9.5" y="15.4" width="5" height="1.6" rx="0.8" fill="currentColor" stroke="none" />
      <rect x="9.8" y="17.4" width="4.4" height="1.3" rx="0.65" fill="currentColor" stroke="none" />
      <rect x="10.2" y="19.1" width="3.6" height="1.5" rx="0.75" fill="currentColor" stroke="none" />
      <path d="M12 1.5v1.6M5.5 4l1.1 1.1M18.5 4l-1.1 1.1M2 10h1.6M20.4 10H22" strokeWidth={1.6} />
    </svg>
  );
}

// Bombilla apagada: mismo cristal, sin relleno ni rayos.
function LightbulbOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={22}
      height={22}
    >
      <circle cx="12" cy="10" r="6" />
      <path d="M9.8 10.6l1.7 1.7 1.7-3.4 1.3 1.7" strokeWidth={1.3} />
      <rect x="9.5" y="15.4" width="5" height="1.6" rx="0.8" />
      <rect x="9.8" y="17.4" width="4.4" height="1.3" rx="0.65" />
      <rect x="10.2" y="19.1" width="3.6" height="1.5" rx="0.75" />
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
        <LightbulbOnIcon />
      </span>
      <span className={`${styles.icon} ${styles.iconOff} ${!isLight ? styles.visible : styles.hidden}`}>
        <LightbulbOffIcon />
      </span>
    </button>
  );
}
