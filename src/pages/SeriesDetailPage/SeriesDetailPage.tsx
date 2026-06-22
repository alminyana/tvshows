import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSeriesById, useAuth, useNotification } from '@/hooks';
import { seriesService, imageService } from '@/services';
import { Rating, Tag, Spinner, Button, ConfirmDialog } from '@/components/ui';
import { MESSAGES } from '@/constants';
import styles from './SeriesDetailPage.module.scss';

export function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { series, loading, notFound, error } = useSeriesById(id!);
  const { user } = useAuth();
  const { notify } = useNotification();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canModify =
    user !== null &&
    (user.role === 'admin' || (user.role === 'user' && series?.createdBy === user.id));

  async function handleDelete() {
    if (!series) return;
    await seriesService.remove(series.id);
    if (series.coverImage) await imageService.remove(series.coverImage);
    notify(MESSAGES.notifications.seriesDeleted);
    navigate('/series');
  }

  useEffect(() => {
    if (!series?.coverImage) return;
    let src: string | undefined;
    imageService.getSrc(series.coverImage).then((s) => {
      src = s;
      if (s) setImageUrl(s);
    });
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [series?.coverImage]);

  if (loading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || error) {
    return (
      <div className={styles.center}>
        <p className={styles.error}>{MESSAGES.errors.notFound}</p>
        <Button variant="secondary" onClick={() => navigate('/series')}>
          {MESSAGES.actions.back}
        </Button>
      </div>
    );
  }

  if (!series) return null;

  return (
    <article className={styles.page}>
      <div className={styles.topBar}>
        <Button
          variant="ghost"
          onClick={() => navigate('/series')}
          className={styles.back}
        >
          ← {MESSAGES.actions.back}
        </Button>

        {canModify && (
          <div className={styles.actions}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/series/${id}/edit`)}
            >
              {MESSAGES.actions.edit}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              {MESSAGES.actions.delete}
            </Button>
          </div>
        )}
      </div>

      <div className={styles.layout}>
        <aside className={styles.cover}>
          {imageUrl ? (
            <img src={imageUrl} alt={series.title} className={styles.image} />
          ) : (
            <div className={styles.placeholder} aria-hidden="true" />
          )}
        </aside>

        <div className={styles.content}>
          <h1 className={styles.title}>{series.title}</h1>

          <div className={styles.meta}>
            <span className={styles.year}>{series.year}</span>
            <span className={styles.seasons}>{series.seasons}</span>
          </div>

          <Rating value={series.rating} readOnly label={MESSAGES.series.rating} />

          <div className={styles.genres}>
            {series.genres.map((g) => (
              <Tag key={g} label={g} />
            ))}
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{MESSAGES.series.synopsis}</h2>
            <p className={styles.text}>{series.synopsis}</p>
          </section>

          {series.cast.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{MESSAGES.series.cast}</h2>
              <div className={styles.castList}>
                {series.cast.map((name) => (
                  <Tag key={name} label={name} />
                ))}
              </div>
            </section>
          )}

          {series.opinion && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{MESSAGES.series.opinion}</h2>
              <p className={styles.text}>{series.opinion}</p>
            </section>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={MESSAGES.series.deleteConfirm}
        message={MESSAGES.series.deleteConfirmDetail}
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </article>
  );
}
