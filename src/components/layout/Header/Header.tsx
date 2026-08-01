import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks';
import { useAuth } from '@/hooks';
import { ThemeToggle } from '@/components/ui';
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

  const navLinks = [
    { to: '/series', label: MESSAGES.nav.series },
    { to: '/dashboard', label: MESSAGES.nav.dashboard },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo} aria-label="TV Shows — inicio">
          📺 TV Shows
        </NavLink>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Navegación principal">
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

        <div className={styles.controls}>
          <div className={styles.themeControls}>
            <select
              className={styles.themeSelect}
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              aria-label={MESSAGES.theme.label}
            >
              {THEMES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <ThemeToggle />
          </div>

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
            className={styles.hamburger}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
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
