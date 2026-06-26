-- Mesas y pedidos por mesa (POS ligero)

-- ---------------------------------------------------------------------------
-- tables (mesas del restaurante)
-- ---------------------------------------------------------------------------
create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  slug text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tables_restaurant_slug_unique unique (restaurant_id, slug),
  constraint tables_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists tables_restaurant_id_idx on public.tables (restaurant_id);

comment on table public.tables is 'Mesas físicas del restaurante; cada una tiene slug para QR';

-- ---------------------------------------------------------------------------
-- orders (pedidos vinculados a mesa)
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  table_id uuid not null references public.tables (id) on delete restrict,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'pending',
  total numeric(10, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check check (
    status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')
  ),
  constraint orders_items_is_array check (jsonb_typeof(items) = 'array'),
  constraint orders_total_non_negative check (total >= 0)
);

create index if not exists orders_restaurant_id_idx on public.orders (restaurant_id);
create index if not exists orders_table_id_idx on public.orders (table_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

comment on column public.orders.items is
  'Array JSON: [{menu_item_id, name, quantity, unit_price, line_total, variation_id?, variation_name?}]';

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
drop trigger if exists set_tables_updated_at on public.tables;
create trigger set_tables_updated_at
  before update on public.tables
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS tables
-- ---------------------------------------------------------------------------
alter table public.tables enable row level security;

drop policy if exists tables_owner_all on public.tables;
create policy tables_owner_all
  on public.tables
  for all
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = tables.restaurant_id and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = tables.restaurant_id and r.owner_id = (select auth.uid())
    )
  );

drop policy if exists tables_select_public on public.tables;
create policy tables_select_public
  on public.tables
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.restaurants r
      where r.id = tables.restaurant_id and r.is_active = true
    )
  );

-- ---------------------------------------------------------------------------
-- RLS orders
-- ---------------------------------------------------------------------------
alter table public.orders enable row level security;

drop policy if exists orders_owner_select on public.orders;
create policy orders_owner_select
  on public.orders
  for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = orders.restaurant_id and r.owner_id = (select auth.uid())
    )
  );

drop policy if exists orders_owner_update on public.orders;
create policy orders_owner_update
  on public.orders
  for update
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = orders.restaurant_id and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = orders.restaurant_id and r.owner_id = (select auth.uid())
    )
  );

drop policy if exists orders_insert_public on public.orders;
create policy orders_insert_public
  on public.orders
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = orders.restaurant_id and r.is_active = true
    )
    and exists (
      select 1 from public.tables t
      where t.id = orders.table_id
        and t.restaurant_id = orders.restaurant_id
        and t.is_active = true
    )
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on table public.tables to authenticated;
grant select on table public.tables to anon;

grant select, update on table public.orders to authenticated;
grant insert on table public.orders to anon, authenticated;
