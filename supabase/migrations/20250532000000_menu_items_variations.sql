-- Variaciones de producto: [{ "description": "500ml...", "price": 10 }, ...]

alter table public.menu_items
  add column if not exists variations jsonb not null default '[]'::jsonb;

comment on column public.menu_items.variations is
  'Presentaciones del producto. Array JSON: [{description: string, price: number}]';

alter table public.menu_items
  drop constraint if exists menu_items_variations_is_array;

alter table public.menu_items
  add constraint menu_items_variations_is_array
  check (jsonb_typeof(variations) = 'array');
