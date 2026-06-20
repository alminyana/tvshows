-- ============================================================
-- profiles: 1:1 con auth.users
-- ============================================================
create table public.profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  email      text        not null,
  role       text        not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ============================================================
-- genres: catálogo único de géneros
-- ============================================================
create table public.genres (
  id   uuid primary key default gen_random_uuid(),
  name text not null
);

create unique index genres_name_unique on public.genres (lower(name));

alter table public.genres enable row level security;

-- ============================================================
-- series
-- ============================================================
create table public.series (
  id               uuid        primary key default gen_random_uuid(),
  title            text        not null,
  synopsis         text        not null default '',
  seasons          text        not null,
  year             int,
  rating           int         check (rating between 0 and 5),
  opinion          text,
  cover_image_path text,
  created_by       uuid        references public.profiles(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.series enable row level security;

-- Actualiza updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger series_set_updated_at
  before update on public.series
  for each row execute function public.set_updated_at();

-- ============================================================
-- series_genres: puente N:M
-- ============================================================
create table public.series_genres (
  series_id uuid not null references public.series(id) on delete cascade,
  genre_id  uuid not null references public.genres(id) on delete cascade,
  primary key (series_id, genre_id)
);

alter table public.series_genres enable row level security;

-- ============================================================
-- Helper: is_admin()
-- Usa security definer para leer profiles con privilegios elevados,
-- evitando recursión con las propias políticas RLS de profiles.
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- RLS — profiles
-- ============================================================
create policy "profiles: lectura propia o admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles: actualización propia o admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin());

-- ============================================================
-- RLS — genres
-- ============================================================
create policy "genres: lectura pública"
  on public.genres for select
  using (true);

create policy "genres: inserción para autenticados"
  on public.genres for insert
  with check (auth.uid() is not null);

-- ============================================================
-- RLS — series
-- ============================================================
create policy "series: lectura pública"
  on public.series for select
  using (true);

create policy "series: inserción para autenticados"
  on public.series for insert
  with check (auth.uid() is not null);

create policy "series: actualización por dueño o admin"
  on public.series for update
  using (created_by = auth.uid() or public.is_admin());

create policy "series: borrado por dueño o admin"
  on public.series for delete
  using (created_by = auth.uid() or public.is_admin());

-- ============================================================
-- RLS — series_genres
-- ============================================================
create policy "series_genres: lectura pública"
  on public.series_genres for select
  using (true);

create policy "series_genres: inserción ligada a permiso sobre la serie"
  on public.series_genres for insert
  with check (
    exists (
      select 1 from public.series s
      where s.id = series_id
        and (s.created_by = auth.uid() or public.is_admin())
    )
  );

create policy "series_genres: borrado ligado a permiso sobre la serie"
  on public.series_genres for delete
  using (
    exists (
      select 1 from public.series s
      where s.id = series_id
        and (s.created_by = auth.uid() or public.is_admin())
    )
  );

-- ============================================================
-- Trigger: crea profile automáticamente al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Storage: bucket covers
-- ============================================================
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "covers: lectura pública"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "covers: subida para autenticados"
  on storage.objects for insert
  with check (bucket_id = 'covers' and auth.uid() is not null);

create policy "covers: borrado por dueño o admin"
  on storage.objects for delete
  using (
    bucket_id = 'covers'
    and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
  );
