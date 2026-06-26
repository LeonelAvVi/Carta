-- Corrige RLS de orders: insert público (anon) y lectura/actualización del dueño.
--
-- Nota: anon solo tiene INSERT en orders (no SELECT). El cliente no debe usar
-- .select() tras insertar; PostgREST necesita SELECT para devolver filas.

-- ---------------------------------------------------------------------------
-- Grants (Data API + PostgREST)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on table public.tables to anon, authenticated;
grant select, insert, update, delete on table public.tables to authenticated;

grant insert on table public.orders to anon, authenticated;
grant select, update on table public.orders to authenticated;

-- ---------------------------------------------------------------------------
-- INSERT público: restaurante activo + mesa activa del mismo restaurante
-- ---------------------------------------------------------------------------
drop policy if exists orders_insert_public on public.orders;

create policy orders_insert_public
  on public.orders
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.restaurants r
      where r.id = restaurant_id
        and r.is_active = true
    )
    and exists (
      select 1
      from public.tables t
      where t.id = table_id
        and t.restaurant_id = restaurant_id
        and t.is_active = true
    )
  );

-- ---------------------------------------------------------------------------
-- Dueño: leer pedidos de su restaurante (dashboard /dashboard/pedidos)
-- ---------------------------------------------------------------------------
drop policy if exists orders_owner_select on public.orders;

create policy orders_owner_select
  on public.orders
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.restaurants r
      where r.id = orders.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Dueño: actualizar estado del pedido
-- ---------------------------------------------------------------------------
drop policy if exists orders_owner_update on public.orders;

create policy orders_owner_update
  on public.orders
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.restaurants r
      where r.id = orders.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.restaurants r
      where r.id = orders.restaurant_id
        and r.owner_id = (select auth.uid())
    )
  );
