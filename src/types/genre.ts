// Los géneros son texto libre desde H10: además de los predefinidos, el usuario
// puede crear géneros nuevos (catálogo dinámico en localStorage, ver utils/genresCatalog).
// Por eso `Genre` es un alias de string en lugar de un union cerrado.
export type Genre = string;

// Catálogo de géneros predefinidos (semilla del selector y del seed).
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
