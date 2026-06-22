import { supabase } from '@/lib/supabase';
import type { Series } from '@/types/series';
import type { ISeriesService } from './types';
import {
  mapDbRowToSeries,
  mapSeriesToDbInsert,
  mapSeriesToDbUpdate,
  type SeriesDbRow,
} from './mappers/seriesMapper';

const SELECT_WITH_GENRES = '*, series_genres(genres(name))';

async function resolveGenreIds(names: string[]): Promise<string[]> {
  if (names.length === 0) return [];
  const { data, error } = await supabase.from('genres').select('id, name').in('name', names);
  if (error) throw error;
  return (data ?? []).map((g) => g.id);
}

export const seriesServiceSupabase: ISeriesService = {
  async getAll(): Promise<Series[]> {
    const { data, error } = await supabase
      .from('series')
      .select(SELECT_WITH_GENRES)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as SeriesDbRow[]).map(mapDbRowToSeries);
  },

  async getById(id: string): Promise<Series | undefined> {
    const { data, error } = await supabase
      .from('series')
      .select(SELECT_WITH_GENRES)
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw error;
    }
    return data ? mapDbRowToSeries(data as SeriesDbRow) : undefined;
  },

  async create(data: Omit<Series, 'id' | 'createdAt' | 'updatedAt'>): Promise<Series> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const { error: insertError } = await supabase
      .from('series')
      .insert(mapSeriesToDbInsert(data, id, now));
    if (insertError) throw insertError;

    const genreIds = await resolveGenreIds(data.genres);
    if (genreIds.length > 0) {
      const { error: sgError } = await supabase
        .from('series_genres')
        .insert(genreIds.map((genre_id) => ({ series_id: id, genre_id })));
      if (sgError) throw sgError;
    }

    const created = await seriesServiceSupabase.getById(id);
    if (!created) throw new Error(`Serie no encontrada tras crear: ${id}`);
    return created;
  },

  async update(id: string, data: Partial<Omit<Series, 'id' | 'createdAt'>>): Promise<Series> {
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('series')
      .update(mapSeriesToDbUpdate(data, now))
      .eq('id', id);
    if (updateError) throw updateError;

    if (data.genres !== undefined) {
      const { error: deleteError } = await supabase
        .from('series_genres')
        .delete()
        .eq('series_id', id);
      if (deleteError) throw deleteError;

      const genreIds = await resolveGenreIds(data.genres);
      if (genreIds.length > 0) {
        const { error: sgError } = await supabase
          .from('series_genres')
          .insert(genreIds.map((genre_id) => ({ series_id: id, genre_id })));
        if (sgError) throw sgError;
      }
    }

    const updated = await seriesServiceSupabase.getById(id);
    if (!updated) throw new Error(`Serie no encontrada: ${id}`);
    return updated;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('series').delete().eq('id', id);
    if (error) throw error;
  },
};
