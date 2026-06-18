import { GENRES } from '@/types/genre';

// Catálogo dinámico de géneros: predefinidos (GENRES) + personalizados del usuario,
// persistidos en localStorage. Preparado para migrar a una tabla Dexie en Fase 2.
const STORAGE_KEY = 'tv-shows:custom-genres';

export function getCustomGenres(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((g): g is string => typeof g === 'string');
  } catch {
    return [];
  }
}

/** Géneros predefinidos + personalizados, sin duplicados (case-insensitive). */
export function getAllGenres(): string[] {
  const seen = new Set(GENRES.map((g) => g.toLowerCase()));
  const merged = [...GENRES];
  for (const g of getCustomGenres()) {
    const key = g.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(g);
    }
  }
  return merged;
}

/**
 * Añade un género al catálogo personalizado si no existe ya (case-insensitive).
 * Devuelve el nombre canónico (el existente si ya estaba, o el nuevo normalizado),
 * o `null` si el nombre está vacío.
 */
export function addCustomGenre(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const existing = getAllGenres().find((g) => g.toLowerCase() === trimmed.toLowerCase());
  if (existing) return existing;

  try {
    const custom = getCustomGenres();
    custom.push(trimmed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  } catch {
    // localStorage no disponible: el género no persiste, pero se devuelve igualmente
  }
  return trimmed;
}
