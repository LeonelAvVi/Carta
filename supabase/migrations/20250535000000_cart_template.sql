-- Plantilla de carta: elegante | casual | atrevida

alter table public.restaurant_theme
  add column if not exists cart_template text not null default 'elegante'
    check (cart_template in ('elegante', 'casual', 'atrevida'));

comment on column public.restaurant_theme.cart_template is
  'Layout de la carta pública: elegante (centrado), casual (grid), atrevida (sidebar oscuro)';
