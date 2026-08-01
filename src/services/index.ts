import { authServiceSupabase } from './authService.supabase';
import { seriesServiceSupabase } from './seriesService.supabase';
import { imageServiceSupabase } from './imageService.supabase';
import { genresServiceSupabase } from './genresService.supabase';

export const seriesService = seriesServiceSupabase;
export const imageService = imageServiceSupabase;
export const genresService = genresServiceSupabase;
export const authService = authServiceSupabase;
