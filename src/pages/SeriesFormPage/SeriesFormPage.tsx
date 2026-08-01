import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSeriesById, useAuth, useNotification } from '@/hooks';
import { seriesService, imageService } from '@/services';
import { canEditSeries } from '@/utils/permissions';
import { SeriesForm } from '@/components/features';
import type { SeriesFormValues } from '@/utils/seriesSchema';
import { Button, Spinner } from '@/components/ui';
import { MESSAGES } from '@/constants';
import styles from './SeriesFormPage.module.scss';

export function SeriesFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useNotification();
  const isEdit = Boolean(id);

  const { series, loading, notFound } = useSeriesById(id ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isEdit && loading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isEdit && (notFound || !series)) {
    return (
      <div className={styles.center}>
        <p className={styles.error}>{MESSAGES.errors.notFound}</p>
        <Button variant="secondary" onClick={() => navigate('/series')}>
          {MESSAGES.actions.back}
        </Button>
      </div>
    );
  }

  if (isEdit && series && !canEditSeries(user)) {
    return (
      <div className={styles.center}>
        <p className={styles.error}>{MESSAGES.errors.generic}</p>
        <Button variant="secondary" onClick={() => navigate('/series')}>
          {MESSAGES.actions.back}
        </Button>
      </div>
    );
  }

  const initialValues: Partial<SeriesFormValues> | undefined = series
    ? {
        title: series.title,
        synopsis: series.synopsis,
        seasons: series.seasons,
        year: series.year,
        rating: series.rating,
        genres: series.genres,
        cast: series.cast,
        opinion: series.opinion,
      }
    : undefined;

  function normalizeFormData(data: SeriesFormValues) {
    return {
      title: data.title,
      synopsis: data.synopsis ?? '',
      seasons: data.seasons ?? '',
      year: data.year ?? 0,
      rating: data.rating ?? 0,
      genres: data.genres ?? [],
      cast: data.cast ?? [],
      opinion: data.opinion,
    };
  }

  async function handleSubmit(data: SeriesFormValues, file?: File) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = normalizeFormData(data);
      if (isEdit && series) {
        let coverImage = series.coverImage;
        if (file) {
          if (coverImage) await imageService.remove(coverImage);
          coverImage = await imageService.save(file);
        }
        await seriesService.update(series.id, { ...payload, coverImage });
        notify(MESSAGES.notifications.seriesUpdated);
        navigate(`/series/${series.id}`);
      } else {
        const coverImage = file ? await imageService.save(file) : '';
        const created = await seriesService.create({
          ...payload,
          coverImage,
          createdBy: user!.id,
        });
        notify(MESSAGES.notifications.seriesCreated);
        navigate(`/series/${created.id}`);
      }
    } catch {
      setSubmitError(MESSAGES.errors.generic);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => navigate(-1)} className={styles.back}>
          ← {MESSAGES.actions.back}
        </Button>
        <h1 className={styles.title}>
          {isEdit ? MESSAGES.series.editSeries : MESSAGES.series.newSeries}
        </h1>
      </div>

      {submitError && (
        <p className={styles.error} role="alert">
          {submitError}
        </p>
      )}

      <SeriesForm
        initialValues={initialValues}
        existingImageId={series?.coverImage}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
