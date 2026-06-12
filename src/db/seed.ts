import { db } from './database';
import { hashPassword } from '../utils/hashPassword';
import type { User } from '../types/user';
import type { Series } from '../types/series';
import type { Genre } from '../types/genre';

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

  const palette = [
    '#1a1a2e', '#16213e', '#0f3460', '#533483',
    '#2b2d42', '#8d99ae', '#ef233c', '#2d6a4f',
    '#1b4332', '#6a0572',
  ];

  const seriesData: Array<Omit<Series, 'id' | 'coverImage' | 'createdAt' | 'updatedAt'>> = [
    {
      title: 'Breaking Bad',
      synopsis: 'Un profesor de química con cáncer terminal se convierte en fabricante de metanfetamina para asegurar el futuro económico de su familia.',
      seasons: '5 temporadas emitidas entre 2008 y 2013, con un total de 62 episodios.',
      cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Dean Norris'],
      year: 2008,
      rating: 5,
      genres: ['Drama', 'Thriller'] as Genre[],
      opinion: 'Una de las mejores series de la historia. La evolución de Walter White es magistral.',
      createdBy: adminId,
    },
    {
      title: 'The Wire',
      synopsis: 'Un retrato complejo del crimen organizado y las instituciones de Baltimore, desde la policía hasta los traficantes de droga.',
      seasons: '5 temporadas, cada una centrada en una institución distinta de la ciudad.',
      cast: ['Dominic West', 'Idris Elba', 'Lance Reddick', 'Wendell Pierce'],
      year: 2002,
      rating: 5,
      genres: ['Drama', 'Thriller'] as Genre[],
      opinion: 'La serie más inteligente jamás producida para televisión.',
      createdBy: adminId,
    },
    {
      title: 'Stranger Things',
      synopsis: 'En un pequeño pueblo de Indiana, la desaparición de un niño desata misterios sobrenaturales y experimentos secretos del gobierno.',
      seasons: '4 temporadas, con una quinta y última en producción.',
      cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder', 'David Harbour'],
      year: 2016,
      rating: 4,
      genres: ['Ciencia ficción', 'Terror', 'Drama'] as Genre[],
      createdBy: adminId,
    },
    {
      title: 'Chernobyl',
      synopsis: 'La miniserie relata el catastrófico accidente nuclear de 1986 y la historia de quienes arriesgaron su vida para contenerlo.',
      seasons: 'Miniserie de 1 temporada con 5 episodios autoconclusivos.',
      cast: ['Jared Harris', 'Stellan Skarsgård', 'Emily Watson'],
      year: 2019,
      rating: 5,
      genres: ['Drama', 'Thriller'] as Genre[],
      opinion: 'Devastadora y absolutamente imprescindible.',
      createdBy: adminId,
    },
    {
      title: 'Black Mirror',
      synopsis: 'Antología de ciencia ficción que explora las consecuencias inesperadas y oscuras de la tecnología moderna.',
      seasons: '6 temporadas de formato antológico, cada episodio es independiente.',
      cast: ['Daniel Kaluuya', 'Jon Hamm', 'Bryce Dallas Howard'],
      year: 2011,
      rating: 4,
      genres: ['Ciencia ficción', 'Thriller', 'Drama'] as Genre[],
      createdBy: adminId,
    },
    {
      title: 'Fargo',
      synopsis: 'Antología de crimen negro ambientada en el Medio Oeste americano, inspirada en el universo de los hermanos Coen.',
      seasons: '5 temporadas independientes, cada una con su propia historia y reparto.',
      cast: ['Martin Freeman', 'Billy Bob Thornton', 'Kirsten Dunst'],
      year: 2014,
      rating: 4,
      genres: ['Drama', 'Thriller', 'Comedia'] as Genre[],
      createdBy: adminId,
    },
    {
      title: 'Severance',
      synopsis: 'Empleados de Lumon Industries se someten a un procedimiento que separa quirúrgicamente sus recuerdos laborales de los personales.',
      seasons: '2 temporadas estrenadas en 2022 y 2025.',
      cast: ['Adam Scott', 'Patricia Arquette', 'John Turturro', 'Christopher Walken'],
      year: 2022,
      rating: 5,
      genres: ['Ciencia ficción', 'Thriller', 'Drama'] as Genre[],
      opinion: 'La serie más original de los últimos años. Inquietante y adictiva.',
      createdBy: adminId,
    },
    {
      title: 'The Bear',
      synopsis: 'Un joven chef de alta cocina regresa a Chicago para gestionar el restaurante de sándwiches de su familia tras la muerte de su hermano.',
      seasons: '3 temporadas, con una cuarta confirmada.',
      cast: ['Jeremy Allen White', 'Ayo Edebiri', 'Ebon Moss-Bachrach'],
      year: 2022,
      rating: 5,
      genres: ['Drama', 'Comedia'] as Genre[],
      createdBy: userId,
    },
  ];

  const series: Series[] = await Promise.all(
    seriesData.map(async (s, i) => {
      const blob = createPlaceholderBlob(palette[i % palette.length]);
      const coverImage = await saveImage(blob);
      return {
        ...s,
        id: crypto.randomUUID(),
        coverImage,
        createdAt: now,
        updatedAt: now,
      };
    }),
  );

  await db.series.bulkAdd(series);
}
