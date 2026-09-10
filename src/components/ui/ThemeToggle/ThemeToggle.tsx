import { useTheme } from '@/hooks';
import { MESSAGES } from '@/constants';
import styles from './ThemeToggle.module.scss';

// Sol: disco relleno y ocho rayos, mismo trazo que la luna para que el par se
// lea como una sola familia.
function SunIcon() {
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
      <circle cx="12" cy="12" r="4.6" fill="currentColor" fillOpacity={0.18} />
      <path d="M12 2.4v2.4M12 19.2v2.4M2.4 12h2.4M19.2 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7" />
    </svg>
  );
}

// Media luna: un disco al que otro disco desplazado le muerde el lado derecho.
// Trazada como una sola `path` para que el borde quede limpio en cualquier tamaño.
function CrescentMoonIcon() {
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
      <path
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"
        fill="currentColor"
        fillOpacity={0.18}
      />
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
      <span className={`${styles.icon} ${isLight ? styles.visible : styles.hidden}`}>
        <SunIcon />
      </span>
      <span className={`${styles.icon} ${!isLight ? styles.visible : styles.hidden}`}>
        <CrescentMoonIcon />
      </span>
    </button>
  );
}
