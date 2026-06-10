-- restaurant_theme, item_variations, campos de contacto y trigger handle_new_restaurant

-- ---------------------------------------------------------------------------
-- restaurants: contacto para pie de carta
-- ---------------------------------------------------------------------------
alter table public.restaurants
  add column if not exists address text,
  add column if not exists phone text;

-- ---------------------------------------------------------------------------
-- menu_items: destacado
-- ---------------------------------------------------------------------------
alter table public.menu_items
  add column if not exists is_featured boolean not null default false;

-- ---------------------------------------------------------------------------
-- restaurant_theme
-- ---------------------------------------------------------------------------
create table if not exists public.restaurant_theme (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null unique references public.restaurants (id) on delete cascade,
  header_bg_color text not null default '#faf8f5',
  header_bg_image_url text,
  header_overlay_color text not null default '#000000',
  header_overlay_opacity integer not null default 40,
  header_name_color text not null default '#1a1209',
  header_desc_color text not null default '#7a6a58',
  logo_border_color text not null default '#e8e0d4',
  show_hours boolean not null default true,
  hours_text text not null default 'Lun–Sáb 7:00–21:00',
  hours_color text not null default '#7a6a58',
  font_style text not null default 'clasica'
    check (font_style in ('clasica', 'moderna', 'editorial', 'tecnica')),
  body_bg_color text not null default '#faf8f5',
  body_bg_image_url text,
  body_overlay_color text not null default '#ffffff',
  body_overlay_opacity integer not null default 60,
  tab_bg_color text not null default '#ffffff',
  tab_text_color text not null default '#7a6a58',
  tab_border_color text not null default '#e8e0d4',
  tab_active_bg_color text not null default '#8B4513',
  tab_active_text_color text not null default '#ffffff',
  tab_active_border_color text not null default '#8B4513',
  tab_border_radius text not null default 'pill'
    check (tab_border_radius in ('pill', 'rounded', 'square')),
  category_container_bg text not null default '#ffffff',
  category_container_border text not null default '#e8e0d4',
  category_title_color text not null default '#1a1209',
  category_accent_color text not null default '#8B4513',
  item_bg_color text not null default '#ffffff',
  item_border_color text not null default '#e8e0d4',
  item_name_color text not null default '#1a1209',
  item_desc_color text not null default '#7a6a58',
  item_price_color text not null default '#8B4513',
  item_image_placeholder_bg text not null default '#f5ede6',
  badge_featured_bg text not null default '#f5ede6',
  badge_featured_text_color text not null default '#5c2d0a',
  badge_featured_label text not null default '⭐ Destacado',
  badge_unavailable_bg text not null default '#fef2f2',
  badge_unavailable_text_color text not null default '#b91c1c',
  badge_unavailable_label text not null default 'Agotado',
  variation_bg_color text not null default '#f5ede6',
  variation_text_color text not null default '#5c2d0a',
  variation_price_color text not null default '#8B4513',
  footer_bg_color text not null default '#ffffff',
  footer_text_color text not null default '#7a6a58',
  show_instagram boolean not null default true,
  instagram_url text,
  show_facebook boolean not null default true,
  facebook_url text,
  show_whatsapp boolean not null default true,
  whatsapp_number text,
  show_tiktok boolean not null default false,
  tiktok_url text,
  social_icon_bg text not null default '#f5ede6',
  social_icon_color text not null default '#8B4513',
  show_address boolean not null default true,
  show_phone boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurant_theme_header_overlay_opacity_check
    check (header_overlay_opacity >= 0 and header_overlay_opacity <= 80),
  constraint restaurant_theme_body_overlay_opacity_check
    check (body_overlay_opacity >= 0 and body_overlay_opacity <= 80)
);

create index if not exists restaurant_theme_restaurant_id_idx
  on public.restaurant_theme (restaurant_id);

-- ---------------------------------------------------------------------------
-- item_variations
-- ---------------------------------------------------------------------------
create table if not exists public.item_variations (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items (id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null,
  position integer not null default 0,
  is_available boolean not null default true
);

create index if not exists item_variations_menu_item_id_idx
  on public.item_variations (menu_item_id);

-- Migrar variaciones JSONB existentes a item_variations
insert into public.item_variations (menu_item_id, name, price, position, is_available)
select
  mi.id,
  coalesce(v.value ->> 'description', v.value ->> 'name', 'Variación'),
  (v.value ->> 'price')::numeric(10, 2),
  v.ordinality - 1,
  true
from public.menu_items mi
cross join lateral jsonb_array_elements(mi.variations) with ordinality as v(value, ordinality)
where jsonb_array_length(mi.variations) > 0
  and not exists (
    select 1 from public.item_variations iv where iv.menu_item_id = mi.id
  );

-- ---------------------------------------------------------------------------
-- Trigger: tema por defecto al crear restaurante
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_restaurant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.restaurant_theme (restaurant_id)
  values (new.id)
  on conflict (restaurant_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_restaurant_created on public.restaurants;

create trigger on_restaurant_created
  after insert on public.restaurants
  for each row
  execute function public.handle_new_restaurant();

-- Backfill tema para restaurantes existentes
insert into public.restaurant_theme (restaurant_id)
select r.id
from public.restaurants r
where not exists (
  select 1 from public.restaurant_theme rt where rt.restaurant_id = r.id
);

-- updated_at en restaurant_theme
drop trigger if exists set_restaurant_theme_updated_at on public.restaurant_theme;
create trigger set_restaurant_theme_updated_at
  before update on public.restaurant_theme
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Storage: fondos de tema
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'theme-backgrounds',
  'theme-backgrounds',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists theme_backgrounds_public_select on storage.objects;
create policy theme_backgrounds_public_select
  on storage.objects for select to public
  using (bucket_id = 'theme-backgrounds');

drop policy if exists theme_backgrounds_owner_insert on storage.objects;
create policy theme_backgrounds_owner_insert
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'theme-backgrounds'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists theme_backgrounds_owner_update on storage.objects;
create policy theme_backgrounds_owner_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'theme-backgrounds'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'theme-backgrounds'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists theme_backgrounds_owner_delete on storage.objects;
create policy theme_backgrounds_owner_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'theme-backgrounds'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ---------------------------------------------------------------------------
-- RLS restaurant_theme
-- ---------------------------------------------------------------------------
alter table public.restaurant_theme enable row level security;

drop policy if exists "theme: lectura pública" on public.restaurant_theme;
create policy "theme: lectura pública"
  on public.restaurant_theme
  for select
  using (true);

drop policy if exists "theme: insert solo del owner" on public.restaurant_theme;
create policy "theme: insert solo del owner"
  on public.restaurant_theme
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = (select auth.uid())
    )
  );

drop policy if exists "theme: update solo del owner" on public.restaurant_theme;
create policy "theme: update solo del owner"
  on public.restaurant_theme
  for update
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = (select auth.uid())
    )
  );

grant select on table public.restaurant_theme to anon, authenticated;
grant insert, update on table public.restaurant_theme to authenticated;

-- ---------------------------------------------------------------------------
-- RLS item_variations
-- ---------------------------------------------------------------------------
alter table public.item_variations enable row level security;

drop policy if exists item_variations_owner_all on public.item_variations;
create policy item_variations_owner_all
  on public.item_variations
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.menu_items mi
      join public.restaurants r on r.id = mi.restaurant_id
      where mi.id = item_variations.menu_item_id
        and r.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.menu_items mi
      join public.restaurants r on r.id = mi.restaurant_id
      where mi.id = item_variations.menu_item_id
        and r.owner_id = (select auth.uid())
    )
  );

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
        and mi.is_available = true
        and r.is_active = true
    )
  );

grant select, insert, update, delete on table public.item_variations to authenticated;
grant select on table public.item_variations to anon;
