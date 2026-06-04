import { z } from 'zod';
import { GENRES } from '@/types/genre';
import type { Genre } from '@/types/genre';

const currentYear = new Date().getFullYear();

export const seriesSchema = z.object({
  title: z.string().min(1, 'Campo obligatorio.'),
  synopsis: z.string().min(1, 'Campo obligatorio.'),
  seasons: z.coerce
    .number({ invalid_type_error: 'Campo obligatorio.' })
    .int()
    .min(1, 'El valor mínimo es 1.'),
  year: z.coerce
    .number({ invalid_type_error: 'Campo obligatorio.' })
    .int()
    .min(1900, 'El valor mínimo es 1900.')
    .max(currentYear, `El valor máximo es ${currentYear}.`),
  rating: z
    .number({ required_error: 'Selecciona una valoración.' })
    .int()
    .min(1, 'Selecciona una valoración.')
    .max(5),
  genres: z
    .array(z.enum(GENRES as [Genre, ...Genre[]]))
    .min(1, 'Selecciona al menos un género.'),
  cast: z.array(z.string().min(1)).optional(),
  opinion: z.string().optional(),
});

export type SeriesFormValues = z.infer<typeof seriesSchema>;
