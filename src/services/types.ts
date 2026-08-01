import type { Series } from '@/types/series';
import type { User } from '@/types/user';

export interface ISeriesService {
  getAll(): Promise<Series[]>;
  getById(id: string): Promise<Series | undefined>;
  create(data: Omit<Series, 'id' | 'createdAt' | 'updatedAt'>): Promise<Series>;
  update(id: string, data: Partial<Omit<Series, 'id' | 'createdAt'>>): Promise<Series>;
  remove(id: string): Promise<void>;
}

// get(id)→Blob es exclusivo del mock; getUrl(path)→string es exclusivo de Supabase.
// Ambas implementaciones satisfacen este contrato mínimo. F5 alinea los consumidores.
export interface IImageService {
  save(input: Blob | File): Promise<string>;
  remove(idOrPath: string): Promise<void>;
  getSrc(idOrPath: string): Promise<string | undefined>;
}

export interface IGenresService {
  getAll(): Promise<string[]>;
  add(name: string): Promise<string | null>;
  remove(name: string): Promise<void>;
}

export interface IAuthService {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  subscribe(callback: (user: User | null) => void): () => void;
}
