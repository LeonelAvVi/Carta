-- Agotado (is_available=false) = visible con badge, no pedible.
-- Oculto (is_visible=false) = no aparece en la carta pública.
-- Antes: is_available=false ocultaba el plato; migrar esos a is_visible=false.

alter table public.menu_items
  add column if not exists is_visible boolean not null default true;

comment on column public.menu_items.is_available is
  'false = agotado: se muestra en la carta con etiqueta y no se puede pedir';
comment on column public.menu_items.is_visible is
  'false = oculto: no aparece en la carta pública; sigue en el dashboard';

-- Mantener el comportamiento previo: lo que estaba "agotado" seguía oculto al comensal.
update public.menu_items
set
  is_visible = false,
  is_available = true
where is_available = false;

create index if not exists menu_items_restaurant_visible_idx
  on public.menu_items (restaurant_id)
  where is_visible = true;

-- Lectura pública: visibles (incl. agotados). Dueño/empleado siguen con sus policies.
drop policy if exists menu_items_select_public on public.menu_items;
create policy menu_items_select_public
  on public.menu_items
  for select
  to anon, authenticated
  using (
    is_visible = true
    and exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id and r.is_active = true
    )
  );

-- Variaciones públicas: del plato visible (aunque esté agotado).
drop policy if exists item_variations_select_public on public.item_variations;
create policy item_variations_select_public
  on public.item_variations
  for select
  to anon, authenticated
  using (
    is_available = true
    and exists (
      select 1
      from public.menu_items mi
      join public.restaurants r on r.id = mi.restaurant_id
      where mi.id = item_variations.menu_item_id
        and mi.is_visible = true
        and r.is_active = true
    )
  );
