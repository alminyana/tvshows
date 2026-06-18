import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const seriesSchema = z.object({
  title: z.string().min(1, 'Campo obligatorio.'),
  synopsis: z.string().min(1, 'Campo obligatorio.'),
  seasons: z.string().min(1, 'Campo obligatorio.'),
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
    .array(z.string().min(1))
    .min(1, 'Selecciona al menos un género.'),
  cast: z.array(z.string().min(1)).optional(),
  opinion: z.string().optional(),
});

export type SeriesFormValues = z.infer<typeof seriesSchema>;
