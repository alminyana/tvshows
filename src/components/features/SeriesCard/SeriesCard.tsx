import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageService } from '@/services';
import { Rating } from '@/components/ui';
import type { Series } from '@/types';
import styles from './SeriesCard.module.scss';

interface Props {
  series: Series;
}

export function SeriesCard({ series }: Props) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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
      className={styles.card}
      onClick={() => navigate(`/series/${series.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/series/${series.id}`)}
      aria-label={series.title}
    >
      <div className={styles.cover}>
        {imageUrl ? (
          <img src={imageUrl} alt={series.title} className={styles.image} />
        ) : (
          <div className={styles.placeholder} aria-hidden="true" />
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{series.title}</h3>
        <span className={styles.year}>{series.year}</span>
        <Rating value={series.rating} readOnly />
      </div>
    </article>
  );
}
