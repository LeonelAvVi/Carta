-- Ranking de productos vendidos por periodo (analytics)

create or replace function public.get_top_products_by_period(
  p_restaurant_id uuid,
  p_year int,
  p_month int
)
returns json
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_start timestamptz;
  v_end timestamptz;
begin
  if p_month < 1 or p_month > 12 or p_year < 2000 or p_year > 2100 then
    raise exception 'Periodo no válido';
  end if;

  if not exists (
    select 1
    from public.restaurants r
    where r.id = p_restaurant_id
      and r.owner_id = (select auth.uid())
  ) then
    raise exception 'No autorizado';
  end if;

  v_start := make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'America/La_Paz');
  v_end := v_start + interval '1 month';

  return (
    select json_build_object(
      'products',
      coalesce(
        (
          select json_agg(row_to_json(top_rows) order by top_rows.rank)
          from (
            select
              row_number() over (order by sum((elem->>'quantity')::numeric) desc) as rank,
              elem->>'menu_item_id' as menu_item_id,
              max(elem->>'name') as name,
              sum((elem->>'quantity')::numeric)::int as total_quantity,
              sum((elem->>'line_total')::numeric) as total_revenue
            from public.orders o
            cross join lateral jsonb_array_elements(o.items) as elem
            where o.restaurant_id = p_restaurant_id
              and o.status = 'delivered'
              and o.created_at >= v_start
              and o.created_at < v_end
            group by elem->>'menu_item_id'
            order by sum((elem->>'quantity')::numeric) desc
            limit 10
          ) top_rows
        ),
        '[]'::json
      ),
      'total_revenue',
      coalesce(
        (
          select sum(o.total)
          from public.orders o
          where o.restaurant_id = p_restaurant_id
            and o.status = 'delivered'
            and o.created_at >= v_start
            and o.created_at < v_end
        ),
        0
      ),
      'order_count',
      coalesce(
        (
          select count(*)::int
          from public.orders o
          where o.restaurant_id = p_restaurant_id
            and o.status = 'delivered'
            and o.created_at >= v_start
            and o.created_at < v_end
        ),
        0
      )
    )
  );
end;
$$;

revoke all on function public.get_top_products_by_period(uuid, int, int) from public;
grant execute on function public.get_top_products_by_period(uuid, int, int) to authenticated;
