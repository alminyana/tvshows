import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageService } from '@/services';
import { Rating } from '@/components/ui';
import type { Series } from '@/types';
import styles from './SeriesRow.module.scss';

interface Props {
  series: Series;
}

export function SeriesRow({ series }: Props) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    imageService.get(series.coverImage).then((blob) => {
      if (blob) {
        url = URL.createObjectURL(blob);
        setImageUrl(url);
      }
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
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

      <div className={styles.info}>
        <h3 className={styles.title}>{series.title}</h3>
        <span className={styles.year}>{series.year}</span>
        <div className={styles.genres}>
          {series.genres.slice(0, 3).map((g) => (
            <span key={g} className={styles.genre}>{g}</span>
          ))}
        </div>
      </div>

      <div className={styles.rating}>
        <Rating value={series.rating} readOnly />
      </div>
    </article>
  );
}
