import type { Genre } from './genre';

export interface Series {
  id: string;
  coverImage: string;
  title: string;
  synopsis: string;
  seasons: number;
  cast: string[];
  year: number;
  opinion?: string;
  rating: number;
  genres: Genre[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
