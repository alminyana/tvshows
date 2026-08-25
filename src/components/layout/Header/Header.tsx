import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks';
import { useAuth } from '@/hooks';
import { Select, ThemeToggle } from '@/components/ui';
import { LoginModal } from '@/components/features';
import { MESSAGES, VALID_THEMES } from '@/constants';
import type { Theme } from '@/types';
import styles from './Header.module.scss';

const THEMES: { value: Theme; label: string }[] = VALID_THEMES.map((value) => ({
  value,
  label: MESSAGES.theme.names[value],
}));

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const navLinks = [
    { to: '/series', label: MESSAGES.nav.series },
    { to: '/dashboard', label: MESSAGES.nav.dashboard },
  ];

  // Cierre del menú móvil con Escape (devolviendo el foco al disparador) y con
  // un click fuera del header. Solo suscrito mientras el panel está abierto.
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      hamburgerRef.current?.focus();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (headerRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={styles.header} role="banner" ref={headerRef}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo} aria-label="TV Shows — inicio">
          📺 TV Shows
        </NavLink>

        <div
          id="header-menu"
          className={`${styles.menuPanel} ${menuOpen ? styles.menuPanelOpen : ''}`}
        >
          <nav className={styles.nav} aria-label="Navegación principal">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.themeControls}>
            {/* Rótulo visible solo en móvil; aria-hidden para no duplicar el
                nombre accesible que el select ya expone vía aria-label. */}
            <span className={styles.themeLabel} aria-hidden="true">
              {MESSAGES.theme.label}
            </span>

            <Select
              className={styles.themeSelect}
              options={THEMES}
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              aria-label={MESSAGES.theme.label}
            />

            <ThemeToggle />
          </div>
        </div>

        <div className={styles.controls}>
          {user ? (
            <div className={styles.userInfo}>
              <span className={styles.userEmail} title={user.email}>
                {user.email}
              </span>
              <button className={styles.logoutButton} onClick={handleLogout}>
                {MESSAGES.nav.logout}
              </button>
            </div>
          ) : (
            <button className={styles.loginButton} onClick={() => setLoginOpen(true)}>
              {MESSAGES.nav.login}
            </button>
          )}

          <button
            ref={hamburgerRef}
            className={styles.hamburger}
            aria-label={menuOpen ? MESSAGES.nav.closeMenu : MESSAGES.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="header-menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>
        </div>
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
