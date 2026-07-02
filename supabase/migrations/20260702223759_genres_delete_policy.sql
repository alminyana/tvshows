-- ============================================================
-- genres: política de borrado, restringida a admin.
-- Borrar un género es una operación de catálogo compartido: por
-- FK ON DELETE CASCADE en series_genres, retira ese género de
-- CUALQUIER serie (de cualquier usuario) que lo tuviera asignado.
-- ============================================================
create policy "genres: borrado solo admin"
  on public.genres for delete
  using (public.is_admin());
