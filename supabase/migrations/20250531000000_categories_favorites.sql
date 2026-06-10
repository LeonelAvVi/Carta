-- Categorías favoritas: un local puede destacar una o varias categorías al inicio de la carta

alter table public.categories
  add column if not exists is_favorite boolean not null default false;

alter table public.categories
  add column if not exists favorite_position integer;

comment on column public.categories.is_favorite is 'Si true, la categoría aparece en la sección destacada de la carta pública';
comment on column public.categories.favorite_position is 'Orden entre categorías favoritas (solo si is_favorite = true)';
