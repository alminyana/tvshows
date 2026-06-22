import type { Series } from '@/types/series';

// Shape que devuelve Supabase con el join series_genres(genres(name))
export interface SeriesDbRow {
  id: string;
  title: string;
  synopsis: string;
  seasons: string;
  year: number | null;
  rating: number | null;
  opinion: string | null;
  cover_image_path: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  series_genres: Array<{ genres: { name: string } | null }>;
}

export function mapDbRowToSeries(row: SeriesDbRow): Series {
  return {
    id: row.id,
    title: row.title,
    synopsis: row.synopsis,
    seasons: row.seasons,
    year: row.year ?? 0,
    rating: row.rating ?? 0,
    opinion: row.opinion ?? undefined,
    coverImage: row.cover_image_path ?? '',
    createdBy: row.created_by ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    genres: row.series_genres.flatMap((sg) => (sg.genres ? [sg.genres.name] : [])),
    // cast no existe en el schema de BD; se omite hasta que se añada la columna
    cast: [],
  };
}

export function mapSeriesToDbInsert(
  data: Omit<Series, 'id' | 'createdAt' | 'updatedAt'>,
  id: string,
  now: string
) {
  return {
    id,
    title: data.title,
    synopsis: data.synopsis,
    seasons: data.seasons,
    year: data.year,
    rating: data.rating,
    opinion: data.opinion ?? null,
    cover_image_path: data.coverImage || null,
    created_by: data.createdBy || null,
    created_at: now,
    updated_at: now,
  };
}

export function mapSeriesToDbUpdate(data: Partial<Omit<Series, 'id' | 'createdAt'>>, now: string) {
  const update: Record<string, unknown> = { updated_at: now };
  if (data.title !== undefined) update.title = data.title;
  if (data.synopsis !== undefined) update.synopsis = data.synopsis;
  if (data.seasons !== undefined) update.seasons = data.seasons;
  if (data.year !== undefined) update.year = data.year;
  if (data.rating !== undefined) update.rating = data.rating;
  if (data.opinion !== undefined) update.opinion = data.opinion ?? null;
  if (data.coverImage !== undefined) update.cover_image_path = data.coverImage || null;
  if (data.createdBy !== undefined) update.created_by = data.createdBy || null;
  return update;
}
