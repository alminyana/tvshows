-- Reparto de cada serie. Se llama cast_members porque `cast` es palabra
-- reservada en Postgres y obligaría a citarla en cada consulta.
alter table public.series
  add column cast_members text[] not null default '{}';
