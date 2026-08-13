-- Expone la lista de pedidos entregados de la mesa (para “Tu cuenta” en la carta).

create or replace function public.get_guest_table_order_status(
  p_restaurant_id uuid,
  p_table_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_status text;
  v_created_at timestamptz;
  v_bill_total numeric;
  v_order_count int;
  v_open_count int;
  v_orders jsonb;
begin
  if p_restaurant_id is null or p_table_id is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.tables t
    where t.id = p_table_id
      and t.restaurant_id = p_restaurant_id
      and t.is_active = true
  ) then
    return null;
  end if;

  select count(*)::int
  into v_open_count
  from public.orders o
  where o.table_id = p_table_id
    and o.restaurant_id = p_restaurant_id
    and o.status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered');

  if v_open_count = 0 then
    return null;
  end if;

  select
    coalesce(sum(o.total), 0),
    count(*)::int
  into v_bill_total, v_order_count
  from public.orders o
  where o.table_id = p_table_id
    and o.restaurant_id = p_restaurant_id
    and o.status = 'delivered';

  select coalesce(
    (
      select jsonb_agg(order_row.obj order by order_row.created_at asc)
      from (
        select
          o.created_at,
          jsonb_build_object(
            'id', o.id,
            'status', o.status,
            'total', o.total,
            'created_at', o.created_at,
            'items', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'name', elem->>'name',
                    'quantity', coalesce((elem->>'quantity')::int, 1),
                    'line_total', coalesce((elem->>'line_total')::numeric, 0),
                    'variation_name', nullif(elem->>'variation_name', '')
                  )
                )
                from jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) as elem
              ),
              '[]'::jsonb
            )
          ) as obj
        from public.orders o
        where o.table_id = p_table_id
          and o.restaurant_id = p_restaurant_id
          and o.status = 'delivered'
      ) as order_row
    ),
    '[]'::jsonb
  )
  into v_orders;

  select o.status, o.created_at
  into v_status, v_created_at
  from public.orders o
  where o.table_id = p_table_id
    and o.restaurant_id = p_restaurant_id
    and o.status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered')
  order by o.created_at desc
  limit 1;

  return jsonb_build_object(
    'status', v_status,
    'created_at', v_created_at,
    'bill_total', v_bill_total,
    'order_count', v_order_count,
    'orders', v_orders
  );
end;
$$;

comment on function public.get_guest_table_order_status(uuid, uuid) is
  'Carta pública: status, total de entregados y lista de pedidos de la cuenta.';
