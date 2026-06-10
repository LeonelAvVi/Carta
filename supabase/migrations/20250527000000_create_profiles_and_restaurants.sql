-- profiles + restaurants
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil extendido del usuario (Supabase Auth)';

-- ---------------------------------------------------------------------------
-- restaurants
-- ---------------------------------------------------------------------------
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  logo_url text,
  primary_color text not null default '#000000',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurants_slug_unique unique (slug),
  constraint restaurants_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

comment on table public.restaurants is 'Restaurante / negocio con carta digital';

create index if not exists restaurants_owner_id_idx on public.restaurants (owner_id);

-- ---------------------------------------------------------------------------
-- Auto-crear profile al registrarse
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;

-- profiles: cada usuario solo ve/edita su perfil
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- restaurants: el dueño gestiona sus restaurantes
drop policy if exists restaurants_select_own on public.restaurants;
create policy restaurants_select_own
  on public.restaurants
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists restaurants_insert_own on public.restaurants;
create policy restaurants_insert_own
  on public.restaurants
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists restaurants_update_own on public.restaurants;
create policy restaurants_update_own
  on public.restaurants
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists restaurants_delete_own on public.restaurants;
create policy restaurants_delete_own
  on public.restaurants
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

-- Carta pública: lectura de restaurantes activos (anon + authenticated)
drop policy if exists restaurants_select_public_active on public.restaurants;
create policy restaurants_select_public_active
  on public.restaurants
  for select
  to anon, authenticated
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- Permisos Data API (PostgREST)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, update on table public.profiles to authenticated;

grant select, insert, update, delete on table public.restaurants to authenticated;
grant select on table public.restaurants to anon;
