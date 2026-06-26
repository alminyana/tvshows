// Los géneros son texto libre: además de los predefinidos, el usuario puede crear
// géneros nuevos (catálogo en la tabla `genres` de Supabase, ver genresService).
// Por eso `Genre` es un alias de string en lugar de un union cerrado.
export type Genre = string;

// Catálogo de géneros predefinidos (semilla inicial migrada a la tabla `genres`).
export const GENRES: Genre[] = [
  'Drama',
  'Comedia',
  'Thriller',
  'Ciencia ficción',
  'Fantasía',
  'Documental',
  'Animación',
  'Acción',
  'Romance',
  'Terror',
];
