import { supabase } from '@/lib/supabase';
import type { IGenresService } from './types';

export const genresServiceSupabase: IGenresService = {
  async getAll(): Promise<string[]> {
    const { data, error } = await supabase.from('genres').select('name').order('name');
    if (error) throw error;
    return (data ?? []).map((g) => g.name);
  },

  async add(name: string): Promise<string | null> {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const { data, error } = await supabase
      .from('genres')
      .insert({ name: trimmed })
      .select('name')
      .single();
    if (error) {
      // 23505 = unique_violation: el género ya existe
      if (error.code === '23505') return trimmed;
      throw error;
    }
    return data.name;
  },
};
