import { authServiceSupabase } from './authService.supabase';
import { seriesServiceSupabase } from './seriesService.supabase';
import { usersServiceSupabase } from './usersService.supabase';
import { imageServiceSupabase } from './imageService.supabase';
import { genresServiceSupabase } from './genresService.supabase';

export const seriesService = seriesServiceSupabase;
export const usersService = usersServiceSupabase;
export const imageService = imageServiceSupabase;
export const genresService = genresServiceSupabase;
export const authService = authServiceSupabase;
