import { db } from './database';
import { hashPassword } from '../utils/hashPassword';
import type { User } from '../types/user';
import type { Series } from '../types/series';
import type { Genre } from '../types/genre';
import rawSeedData from './seed.json';

interface SeedEntry {
  title: string;
  synopsis?: string;
  seasons: string;
  cast?: unknown;
  year?: number | string;
  rating?: number;
}

function parseCast(cast: unknown): string[] {
  if (!Array.isArray(cast)) return [];
  return cast.filter((c): c is string => typeof c === 'string');
}

// Extrae el primer año de valores como "2001-2010" o números directos.
function parseYear(year: unknown): number {
  if (typeof year === 'number') return year;
  if (typeof year === 'string') {
    const match = year.match(/\d{4}/);
    if (match) return parseInt(match[0], 10);
  }
  return new Date().getFullYear();
}

// Asigna géneros por palabras clave en título + sinopsis. Máximo 3.
const GENRE_RULES: Array<[RegExp, Genre]> = [
  [/dragon|trono|magia|reino|elfos|poniente|caballero|medieval/i,          'Fantasía'],
  [/ciencia fic|sci-fi|extraterr|robot|futuro|hongo|apocali|espacio|androide/i, 'Ciencia ficción'],
  [/animaci|anime|dibujos/i,                                                'Animación'],
  [/terror|horror|pesadilla|monstruo|vampiro|zombi/i,                       'Terror'],
  [/amor|romance|sentimental|enamorad|boda|pareja/i,                        'Romance'],
  [/documental|biográfi|biopic|archivo personal/i,                          'Documental'],
  [/narco|droga|cartel|mafia|contrabando|tráfico/i,                         'Thriller'],
  [/polici|detective|fiscal|juicio|abogad|crimen|asesin|fbi|cia|espi|mossad|agente|terrorist|investig|secuestr/i, 'Thriller'],
  [/soldado|militar|veterano|marines|ejército|batalla|guerra/i,              'Acción'],
  [/hospital|médic|doctor|urgencia|enferm|cirujano/i,                        'Drama'],
  [/chef|restaurante|cocina|cocinero/i,                                      'Comedia'],
  [/humor|comedia|gracioso/i,                                                'Comedia'],
  [/familia|sociedad|rivalidad|sucesi|herencia|política|historia|vida/i,     'Drama'],
];

function inferGenres(entry: SeedEntry): Genre[] {
  const text = `${entry.title} ${entry.synopsis ?? ''}`;
  const found = new Set<Genre>();
  for (const [regex, genre] of GENRE_RULES) {
    if (regex.test(text)) found.add(genre);
    if (found.size >= 3) break;
  }
  if (found.size === 0) found.add('Drama');
  return [...found];
}

function createPlaceholderBlob(color: string): Blob {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 450;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 300, 450);
  const dataUrl = canvas.toDataURL('image/png');
  const byteString = atob(dataUrl.split(',')[1]);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'image/png' });
}

async function saveImage(blob: Blob): Promise<string> {
  const id = crypto.randomUUID();
  await db.images.add({ id, blob });
  return id;
}

const palette = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#2b2d42', '#8d99ae', '#ef233c', '#2d6a4f',
  '#1b4332', '#6a0572', '#3d405b', '#81b29a',
  '#f2cc8f', '#e07a5f', '#264653', '#2a9d8f',
];

export async function seedDatabase(): Promise<void> {
  const userCount = await db.users.count();
  if (userCount > 0) return;

  const adminId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const now = new Date().toISOString();

  const [adminHash, userHash] = await Promise.all([
    hashPassword('admin'),
    hashPassword('user'),
  ]);

  const users: User[] = [
    {
      id: adminId,
      email: 'admin@local.dev',
      password: adminHash,
      role: 'admin',
      createdAt: now,
    },
    {
      id: userId,
      email: 'user@local.dev',
      password: userHash,
      role: 'user',
      createdAt: now,
    },
  ];

  await db.users.bulkAdd(users);

  const entries = rawSeedData as SeedEntry[];

  const series: Series[] = await Promise.all(
    entries.map(async (entry, i) => {
      const blob = createPlaceholderBlob(palette[i % palette.length]);
      const coverImage = await saveImage(blob);
      return {
        id: crypto.randomUUID(),
        coverImage,
        title: entry.title,
        synopsis: entry.synopsis ?? '',
        seasons: entry.seasons,
        cast: parseCast(entry.cast),
        year: parseYear(entry.year),
        rating: entry.rating ?? 0,
        genres: inferGenres(entry),
        opinion: undefined,
        createdBy: adminId,
        createdAt: now,
        updatedAt: now,
      };
    }),
  );

  await db.series.bulkAdd(series);
}
