-- categories, menu_items, carta_views, subscriptions

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  position integer not null default 0,
  is_active boolean not null default true
);

create index if not exists categories_restaurant_id_idx on public.categories (restaurant_id);

-- ---------------------------------------------------------------------------
-- menu_items
-- ---------------------------------------------------------------------------
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  description text,
  price decimal(10, 2),
  image_url text,
  is_available boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists menu_items_restaurant_id_idx on public.menu_items (restaurant_id);
create index if not exists menu_items_category_id_idx on public.menu_items (category_id);

-- ---------------------------------------------------------------------------
-- carta_views
-- ---------------------------------------------------------------------------
create table if not exists public.carta_views (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  user_agent text
);

create index if not exists carta_views_restaurant_id_idx on public.carta_views (restaurant_id);
create index if not exists carta_views_viewed_at_idx on public.carta_views (viewed_at desc);

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  plan text not null default 'trial',
  status text not null default 'active',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  constraint subscriptions_plan_check check (plan in ('trial', 'basic', 'pro', 'premium')),
  constraint subscriptions_status_check check (status in ('active', 'expired', 'cancelled')),
  constraint subscriptions_restaurant_id_unique unique (restaurant_id)
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.carta_views enable row level security;
alter table public.subscriptions enable row level security;

-- categories: dueño del restaurante
drop policy if exists categories_owner_all on public.categories;
create policy categories_owner_all
  on public.categories
  for all
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = categories.restaurant_id and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = categories.restaurant_id and r.owner_id = (select auth.uid())
    )
  );

-- categories: lectura pública si restaurante activo
drop policy if exists categories_select_public on public.categories;
create policy categories_select_public
  on public.categories
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.restaurants r
      where r.id = categories.restaurant_id and r.is_active = true
    )
  );

-- menu_items: dueño
drop policy if exists menu_items_owner_all on public.menu_items;
create policy menu_items_owner_all
  on public.menu_items
  for all
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id and r.owner_id = (select auth.uid())
    )
  );

-- menu_items: lectura pública
drop policy if exists menu_items_select_public on public.menu_items;
create policy menu_items_select_public
  on public.menu_items
  for select
  to anon, authenticated
  using (
    is_available = true
    and exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id and r.is_active = true
    )
  );

-- carta_views: dueño lee; cualquiera inserta visita (carta pública)
drop policy if exists carta_views_owner_select on public.carta_views;
create policy carta_views_owner_select
  on public.carta_views
  for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = carta_views.restaurant_id and r.owner_id = (select auth.uid())
    )
  );

drop policy if exists carta_views_insert_public on public.carta_views;
create policy carta_views_insert_public
  on public.carta_views
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = carta_views.restaurant_id and r.is_active = true
    )
  );

-- subscriptions: dueño
drop policy if exists subscriptions_owner_select on public.subscriptions;
create policy subscriptions_owner_select
  on public.subscriptions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = subscriptions.restaurant_id and r.owner_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on table public.categories to authenticated;
grant select on table public.categories to anon;

grant select, insert, update, delete on table public.menu_items to authenticated;
grant select on table public.menu_items to anon;

grant select on table public.carta_views to authenticated;
grant insert on table public.carta_views to anon, authenticated;

grant select on table public.subscriptions to authenticated;
