import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useLandingImages } from '@/hooks';
import { Button } from '@/components/ui';
import { LoginModal } from '@/components/features/LoginModal/LoginModal';
import { MESSAGES } from '@/constants';
import styles from './LandingPage.module.scss';

const SLIDE_INTERVAL_MS = 30_000;

export function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const { images, loading: imagesLoading, hasFallback } = useLandingImages();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(
      () => setCurrentIndex((i) => (i + 1) % images.length),
      SLIDE_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, [images.length]);

  // Esperar a que auth resuelva antes de redirigir — evita flash de contenido
  if (authLoading) return null;
  if (user) return <Navigate to="/series" replace />;

  const loading = imagesLoading;

  return (
    <main className={styles.page}>
      <div className={styles.background} aria-hidden="true">
        {hasFallback ? (
          <div className={styles.fallback} />
        ) : (
          images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`${styles.slide} ${i === currentIndex ? styles.slideActive : ''}`}
            />
          ))
        )}
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>{MESSAGES.landing.title}</h1>
        <p className={styles.claim}>{MESSAGES.landing.claim}</p>
        {!loading && (
          <Button variant="primary" size="lg" onClick={() => setLoginOpen(true)}>
            {MESSAGES.landing.enter}
          </Button>
        )}
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </main>
  );
}
