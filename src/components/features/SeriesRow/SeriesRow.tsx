import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageService } from '@/services';
import { Rating, Tag } from '@/components/ui';
import { categoricalColor } from '@/utils';
import { MESSAGES } from '@/constants';
import type { Series } from '@/types';
import styles from './SeriesRow.module.scss';

const MAX_GENRES = 3;

interface Props {
  series: Series;
}

export function SeriesRow({ series }: Props) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const uniqueGenres = Array.from(new Set(series.genres));
  const visibleGenres = uniqueGenres.slice(0, MAX_GENRES);
  const extraGenres = uniqueGenres.length - visibleGenres.length;

  const uniqueCast = Array.from(new Set(series.cast));

  useEffect(() => {
    let src: string | undefined;
    imageService.getSrc(series.coverImage).then((s) => {
      src = s;
      if (s) setImageUrl(s);
    });
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [series.coverImage]);

  return (
    <article
      className={styles.row}
      onClick={() => navigate(`/series/${series.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/series/${series.id}`)}
      aria-label={series.title}
    >
      <div className={styles.thumbnail}>
        {imageUrl ? (
          <img src={imageUrl} alt={series.title} className={styles.image} />
        ) : (
          <div className={styles.placeholder} aria-hidden="true" />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.main}>
          <h3 className={styles.title}>{series.title}</h3>
          <span className={styles.year}>{series.year}</span>
        </div>

        <div className={styles.duration}>
          <span className={styles.seasons}>{series.seasons}</span>
          {uniqueCast.length > 0 && (
            <p className={styles.cast}>
              <span className={styles.castLabel}>{MESSAGES.series.cast}</span>
              {uniqueCast.join(', ')}
            </p>
          )}
        </div>
        <div className={styles.genres}>
          {visibleGenres.map((g, i) => (
            <Tag key={g} label={g} color={categoricalColor(i)} />
          ))}
          {extraGenres > 0 && <span className={styles.more}>+{extraGenres}</span>}
        </div>
      </div>

      <div className={styles.rating}>
        <Rating value={series.rating} readOnly />
      </div>
    </article>
  );
}
