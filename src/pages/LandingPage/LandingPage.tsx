import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui';
import { LoginModal } from '@/components/features/LoginModal/LoginModal';
import { MESSAGES } from '@/constants';
import bg1 from '@/assets/batalla-de-los-bastardos.webp';
import bg2 from '@/assets/jon-nieve-batalla-de-los-bastardos.webp';
import bg3 from '@/assets/batalla-bastardos.webp';
import bg4 from '@/assets/ramsay.webp';
import bg5 from '@/assets/meñique.webp';
import styles from './LandingPage.module.scss';

const BACKGROUNDS = [bg1, bg2, bg3, bg4, bg5];
const SLIDE_INTERVAL_MS = 5_000;

export function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentIndex((i) => (i + 1) % BACKGROUNDS.length),
      SLIDE_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, []);

  if (authLoading) return null;
  if (user) return <Navigate to="/series" replace />;

  return (
    <main className={styles.page}>
      <div className={styles.background} aria-hidden="true">
        {BACKGROUNDS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`${styles.slide} ${i === currentIndex ? styles.slideActive : ''}`}
          />
        ))}
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>{MESSAGES.landing.title}</h1>
        <p className={styles.claim}>{MESSAGES.landing.claim}</p>
        <Button variant="primary" size="lg" onClick={() => setLoginOpen(true)}>
          {MESSAGES.landing.enter}
        </Button>
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </main>
  );
}
