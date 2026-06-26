-- Empleados del restaurante (staff de mostrador / barra)

-- ---------------------------------------------------------------------------
-- restaurant_employees
-- ---------------------------------------------------------------------------
create table if not exists public.restaurant_employees (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint restaurant_employees_unique unique (restaurant_id, profile_id)
);

create index if not exists restaurant_employees_restaurant_id_idx
  on public.restaurant_employees (restaurant_id);

create index if not exists restaurant_employees_profile_id_idx
  on public.restaurant_employees (profile_id);

comment on table public.restaurant_employees is
  'Personal autorizado por el dueño; solo lectura en carta y pedidos';

-- ---------------------------------------------------------------------------
-- Helpers RLS (security invoker)
-- ---------------------------------------------------------------------------
create or replace function public.is_restaurant_employee(p_restaurant_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.restaurant_employees e
    where e.restaurant_id = p_restaurant_id
      and e.profile_id = (select auth.uid())
  );
$$;

-- Buscar perfil por email (solo dueños con restaurante)
create or replace function public.find_profile_id_by_email(p_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  if (select auth.uid()) is null then
    return null;
  end if;

  if not exists (
    select 1 from public.restaurants r
    where r.owner_id = (select auth.uid())
  ) then
    return null;
  end if;

  select p.id into v_profile_id
  from public.profiles p
  where lower(trim(p.email)) = lower(trim(p_email))
  limit 1;

  return v_profile_id;
end;
$$;

revoke all on function public.find_profile_id_by_email(text) from public;
grant execute on function public.find_profile_id_by_email(text) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS restaurant_employees
-- ---------------------------------------------------------------------------
alter table public.restaurant_employees enable row level security;

drop policy if exists restaurant_employees_owner_all on public.restaurant_employees;
create policy restaurant_employees_owner_all
  on public.restaurant_employees
  for all
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_employees.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_employees.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

drop policy if exists restaurant_employees_self_select on public.restaurant_employees;
create policy restaurant_employees_self_select
  on public.restaurant_employees
  for select
  to authenticated
  using (profile_id = (select auth.uid()));

grant select, insert, delete on table public.restaurant_employees to authenticated;

-- Dueño puede leer perfiles de sus empleados (para listar en /dashboard/equipo)
drop policy if exists profiles_select_restaurant_employees on public.profiles;
create policy profiles_select_restaurant_employees
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.restaurant_employees e
      inner join public.restaurants r on r.id = e.restaurant_id
      where e.profile_id = profiles.id
        and r.owner_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- SELECT para empleados (solo lectura, sin INSERT/UPDATE/DELETE)
-- ---------------------------------------------------------------------------

-- restaurants
drop policy if exists restaurants_employee_select on public.restaurants;
create policy restaurants_employee_select
  on public.restaurants
  for select
  to authenticated
  using (public.is_restaurant_employee(id));

-- tables
drop policy if exists tables_employee_select on public.tables;
create policy tables_employee_select
  on public.tables
  for select
  to authenticated
  using (public.is_restaurant_employee(restaurant_id));

-- orders
drop policy if exists orders_employee_select on public.orders;
create policy orders_employee_select
  on public.orders
  for select
  to authenticated
  using (public.is_restaurant_employee(restaurant_id));

-- categories
drop policy if exists categories_employee_select on public.categories;
create policy categories_employee_select
  on public.categories
  for select
  to authenticated
  using (public.is_restaurant_employee(restaurant_id));

-- menu_items
drop policy if exists menu_items_employee_select on public.menu_items;
create policy menu_items_employee_select
  on public.menu_items
  for select
  to authenticated
  using (public.is_restaurant_employee(restaurant_id));
