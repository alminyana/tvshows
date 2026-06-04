import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSeriesById, useAuth } from '@/hooks';
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

  if (isEdit && series && !canEditSeries(user, series)) {
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

  async function handleSubmit(data: SeriesFormValues, file?: File) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (isEdit && series) {
        let coverImage = series.coverImage;
        if (file) {
          if (coverImage) await imageService.remove(coverImage);
          coverImage = await imageService.save(file);
        }
        await seriesService.update(series.id, { ...data, coverImage });
        navigate(`/series/${series.id}`);
      } else {
        if (!file) {
          setSubmitError('Selecciona una imagen de portada.');
          return;
        }
        const coverImage = await imageService.save(file);
        const created = await seriesService.create({
          ...data,
          cast: data.cast ?? [],
          coverImage,
          createdBy: user!.id,
        });
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
