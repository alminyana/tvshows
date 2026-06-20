import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const seriesSchema = z.object({
  title: z.string().min(1, 'Campo obligatorio.'),
  synopsis: z.string().optional(),
  seasons: z.string().optional(),
  year: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce
      .number()
      .int()
      .min(1900, 'El valor mínimo es 1900.')
      .max(currentYear, `El valor máximo es ${currentYear}.`)
      .optional()
  ),
  rating: z.number().int().min(0).max(5).optional(),
  genres: z.array(z.string().min(1)).optional(),
  cast: z.array(z.string().min(1)).optional(),
  opinion: z.string().optional(),
});

export type SeriesFormValues = z.infer<typeof seriesSchema>;
