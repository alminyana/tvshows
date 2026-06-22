import { supabase } from '@/lib/supabase';
import type { IImageService } from './types';

const BUCKET = 'covers';

export const imageServiceSupabase: IImageService & { getUrl(path: string): string } = {
  async save(input: Blob | File): Promise<string> {
    const file = input instanceof File ? input : new File([input], 'cover', { type: input.type });
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) throw error;
    return path;
  },

  getUrl(path: string): string {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  async remove(path: string): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;
  },
};
