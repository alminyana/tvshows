import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageService } from '@/services';
import { Rating, Tag } from '@/components/ui';
import { MESSAGES } from '@/constants';
import { classifySeasons } from '@/utils/classifySeasons';
import type { SeasonsType } from '@/utils/classifySeasons';
import { categoricalColor } from '@/utils';
import type { Series } from '@/types';
import styles from './SeriesCard.module.scss';

const MAX_GENRES = 3;

// Etiqueta corta de duración para la card (el texto completo se ve en la fila/detalle).
const SEASONS_LABEL: Record<SeasonsType, string> = {
  miniserie: MESSAGES.dashboard.durationMiniserie,
  single: MESSAGES.dashboard.durationSingle,
  multi: MESSAGES.dashboard.durationMulti,
};

interface Props {
  series: Series;
}

export function SeriesCard({ series }: Props) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const uniqueGenres = Array.from(new Set(series.genres));
  const visibleGenres = uniqueGenres.slice(0, MAX_GENRES);
  const extraGenres = uniqueGenres.length - visibleGenres.length;
  const seasonsLabel = SEASONS_LABEL[classifySeasons(series.seasons)];

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
        <p className={styles.meta}>
          {series.year} · {seasonsLabel}
        </p>
        {visibleGenres.length > 0 && (
          <div className={styles.genres}>
            {visibleGenres.map((g, i) => (
              <Tag key={g} label={g} color={categoricalColor(i)} />
            ))}
            {extraGenres > 0 && <span className={styles.more}>+{extraGenres}</span>}
          </div>
        )}
        <div className={styles.rating}>
          <Rating value={series.rating} readOnly />
        </div>
      </div>
    </article>
  );
}
