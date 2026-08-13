-- Descuento de cuenta por mesa (activo) + historial registrado

alter table public.tables
  add column if not exists discount_amount numeric(10, 2) not null default 0,
  add column if not exists discount_description text;

alter table public.tables
  drop constraint if exists tables_discount_amount_non_negative;

alter table public.tables
  add constraint tables_discount_amount_non_negative check (discount_amount >= 0);

comment on column public.tables.discount_amount is
  'Descuento activo de la cuenta abierta de la mesa (Bs.)';
comment on column public.tables.discount_description is
  'Motivo/descripción del descuento activo';

create table if not exists public.table_discounts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  table_id uuid not null references public.tables (id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  description text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  cleared_at timestamptz,
  is_active boolean not null default true
);

create index if not exists table_discounts_table_id_idx
  on public.table_discounts (table_id);

create index if not exists table_discounts_restaurant_id_idx
  on public.table_discounts (restaurant_id);

create unique index if not exists table_discounts_one_active_per_table
  on public.table_discounts (table_id)
  where (is_active = true);

comment on table public.table_discounts is
  'Historial de descuentos de cuenta por mesa; is_active=true es el vigente';

alter table public.table_discounts enable row level security;

drop policy if exists table_discounts_owner_select on public.table_discounts;
create policy table_discounts_owner_select
  on public.table_discounts
  for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = table_discounts.restaurant_id
        and r.owner_id = (select auth.uid())
    )
    or public.is_restaurant_employee(restaurant_id)
  );

grant select on table public.table_discounts to authenticated;

create or replace function public.set_table_discount(
  p_table_id uuid,
  p_amount numeric,
  p_description text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurant_id uuid;
  v_uid uuid := auth.uid();
  v_desc text := nullif(trim(coalesce(p_description, '')), '');
  v_amount numeric := coalesce(p_amount, 0);
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión';
  end if;

  if p_table_id is null then
    raise exception 'Mesa no válida';
  end if;

  if v_amount < 0 then
    raise exception 'El descuento no puede ser negativo';
  end if;

  if v_amount > 0 and v_desc is null then
    raise exception 'Indicá una descripción del descuento';
  end if;

  select t.restaurant_id into v_restaurant_id
  from public.tables t
  where t.id = p_table_id;

  if v_restaurant_id is null then
    raise exception 'Mesa no encontrada';
  end if;

  if not (
    exists (
      select 1 from public.restaurants r
      where r.id = v_restaurant_id and r.owner_id = v_uid
    )
    or public.is_restaurant_employee(v_restaurant_id)
  ) then
    raise exception 'No tienes permiso';
  end if;

  -- Cierra el descuento activo anterior (queda en historial)
  update public.table_discounts
  set is_active = false, cleared_at = now()
  where table_id = p_table_id
    and is_active = true;

  if v_amount = 0 then
    update public.tables
    set discount_amount = 0, discount_description = null
    where id = p_table_id;

    return jsonb_build_object(
      'ok', true,
      'amount', 0,
      'description', null,
      'cleared', true
    );
  end if;

  insert into public.table_discounts (
    restaurant_id, table_id, amount, description, created_by, is_active
  )
  values (
    v_restaurant_id, p_table_id, v_amount, v_desc, v_uid, true
  )
  returning id into v_id;

  update public.tables
  set
    discount_amount = v_amount,
    discount_description = v_desc
  where id = p_table_id;

  return jsonb_build_object(
    'ok', true,
    'id', v_id,
    'amount', v_amount,
    'description', v_desc
  );
end;
$$;

revoke all on function public.set_table_discount(uuid, numeric, text) from public;
grant execute on function public.set_table_discount(uuid, numeric, text) to authenticated;

-- Al cerrar mesa: limpia descuento activo en tables y archiva el registro
create or replace function public.close_restaurant_table(p_table_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurant_id uuid;
  v_uid uuid := auth.uid();
  v_updated int := 0;
  v_active int := 0;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión';
  end if;

  if p_table_id is null then
    raise exception 'Mesa no válida';
  end if;

  select t.restaurant_id
  into v_restaurant_id
  from public.tables t
  where t.id = p_table_id;

  if v_restaurant_id is null then
    raise exception 'Mesa no encontrada';
  end if;

  if not (
    exists (
      select 1
      from public.restaurants r
      where r.id = v_restaurant_id
        and r.owner_id = v_uid
    )
    or public.is_restaurant_employee(v_restaurant_id)
  ) then
    raise exception 'No tienes permiso para cerrar esta mesa';
  end if;

  select count(*)::int
  into v_active
  from public.orders o
  where o.table_id = p_table_id
    and o.restaurant_id = v_restaurant_id
    and o.status in ('pending', 'confirmed', 'preparing', 'ready');

  if v_active > 0 then
    raise exception
      'Hay pedidos sin entregar ni cancelar. Terminá o cancelá antes de cerrar la mesa.';
  end if;

  if not exists (
    select 1
    from public.orders o
    where o.table_id = p_table_id
      and o.restaurant_id = v_restaurant_id
      and o.status in ('delivered', 'cancelled')
  ) then
    raise exception 'No hay nada que cerrar en esta mesa.';
  end if;

  update public.orders o
  set status = 'closed'
  where o.table_id = p_table_id
    and o.restaurant_id = v_restaurant_id
    and o.status in ('delivered', 'cancelled');

  get diagnostics v_updated = row_count;

  update public.table_discounts
  set is_active = false, cleared_at = now()
  where table_id = p_table_id
    and is_active = true;

  update public.tables
  set
    assistance_kind = null,
    assistance_requested_at = null,
    discount_amount = 0,
    discount_description = null
  where id = p_table_id;

  return jsonb_build_object(
    'closed_count', v_updated,
    'table_id', p_table_id
  );
end;
$$;
