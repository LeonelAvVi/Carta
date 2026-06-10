-- Triggers de Supabase suelen usar updated_at; nuestras tablas no la tenían.

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

alter table public.restaurants
  add column if not exists updated_at timestamptz not null default now();

alter table public.subscriptions
  add column if not exists updated_at timestamptz not null default now();

-- Función estándar para mantener updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_restaurants_updated_at on public.restaurants;
create trigger set_restaurants_updated_at
  before update on public.restaurants
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_updated_at();

-- handle_new_user: actualizar updated_at en conflict
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
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
