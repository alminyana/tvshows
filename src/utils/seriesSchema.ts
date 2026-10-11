import { z } from 'zod';

export const seriesSchema = z.object({
  title: z.string().min(1, 'Campo obligatorio.'),
  synopsis: z.string().optional(),
  seasons: z.string().optional(),
  year: z.string().trim().optional(),
  rating: z.number().int().min(0).max(5).optional(),
  genres: z.array(z.string().min(1)).optional(),
  cast: z.array(z.string().min(1)).optional(),
  opinion: z.string().optional(),
});

export type SeriesFormValues = z.infer<typeof seriesSchema>;
