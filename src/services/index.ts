import { seriesService as seriesServiceMock } from './seriesService';
import { imageService as imageServiceMock } from './imageService';
import { authService as authServiceMock } from './authService';
import { usersService as usersServiceMock } from './usersService';
import { authServiceSupabase } from './authService.supabase';
import { seriesServiceSupabase } from './seriesService.supabase';
import { usersServiceSupabase } from './usersService.supabase';
import { imageServiceSupabase } from './imageService.supabase';
import { genresServiceSupabase } from './genresService.supabase';
import { getAllGenres, addCustomGenre } from '@/utils/genresCatalog';
import type { IGenresService } from './types';

const isSupabase = import.meta.env.VITE_DATA_BACKEND === 'supabase';

const genresServiceMock: IGenresService = {
  async getAll() {
    return getAllGenres();
  },
  async add(name: string) {
    return addCustomGenre(name);
  },
};

export const seriesService = isSupabase ? seriesServiceSupabase : seriesServiceMock;
export const usersService = isSupabase ? usersServiceSupabase : usersServiceMock;
export const imageService = isSupabase ? imageServiceSupabase : imageServiceMock;
export const genresService: IGenresService = isSupabase
  ? genresServiceSupabase
  : genresServiceMock;
export const authService = isSupabase ? authServiceSupabase : authServiceMock;
