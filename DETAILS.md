# Carta Digital SaaS — Documentación técnica detallada

Plataforma SaaS para que restaurantes, cafeterías y negocios digitalicen su menú y lo compartan vía QR. El comensal escanea el código y ve una carta web optimizada para móvil, sin instalar ninguna app.

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Modelo de datos (Supabase / PostgreSQL)](#4-modelo-de-datos-supabase--postgresql)
5. [Autenticación y rutas protegidas](#5-autenticación-y-rutas-protegidas)
6. [Flujo: cómo se crea un menú](#6-flujo-cómo-se-crea-un-menú)
7. [Capa de datos (`src/lib/data`)](#7-capa-de-datos-srclibdata)
8. [Dashboard del dueño](#8-dashboard-del-dueño)
9. [Carta pública (`/carta/[slug]`)](#9-carta-públicacartaslug)
10. [Sistema de personalización (temas y plantillas)](#10-sistema-de-personalización-temas-y-plantillas)
11. [Storage (imágenes)](#11-storage-imágenes)
12. [Server Actions](#12-server-actions)
13. [Seguridad (RLS)](#13-seguridad-rls)
14. [Planes y límites de negocio](#14-planes-y-límites-de-negocio)
15. [Variables de entorno](#15-variables-de-entorno)
16. [Migraciones SQL (orden de ejecución)](#16-migraciones-sql-orden-de-ejecución)

---

## 1. Visión general

### Actores

| Actor | Rol |
|-------|-----|
| **Dueño del negocio** | Registra cuenta, configura restaurante, arma categorías y productos, personaliza apariencia, consulta analytics |
| **Comensal** | Escanea QR, abre `/carta/[slug]`, navega el menú en el celular |

### Flujo de alto nivel

```
Registro/Login → Configurar restaurante → Crear categorías → Agregar productos
     → Personalizar apariencia (colores + plantilla) → Compartir QR / URL pública
```

### Jerarquía del menú

```
Usuario (auth.users)
  └── Profile (profiles)
        └── Restaurante (restaurants) — 1 por plan básico
              ├── Tema (restaurant_theme) — 1:1
              ├── Suscripción (subscriptions) — 1:1
              ├── Categorías (categories)
              │     └── Productos (menu_items)
              │           └── Variaciones (item_variations) — 0 o más
              └── Visitas (carta_views)
```

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript (strict) |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth + `@supabase/ssr` |
| Storage | Supabase Storage |
| Estilos | Tailwind CSS v3 |
| Validación | Zod |
| Mutaciones | Server Actions (no Redux/Zustand) |
| Drag & drop (dashboard) | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Gestor de paquetes | **pnpm** (no usar npm) |
| Deploy previsto | Vercel |

---

## 3. Estructura del proyecto

```
Carta/
├── supabase/migrations/          # SQL versionado (ejecutar en Supabase SQL Editor)
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login y registro
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── actions.ts        # Server Actions de auth
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/          # Panel protegido (requiere sesión)
│   │   │   ├── layout.tsx        # Redirige a /login si no hay usuario
│   │   │   └── dashboard/
│   │   │       ├── page.tsx              # Resumen
│   │   │       ├── restaurante/          # Datos del negocio
│   │   │       ├── carta/                 # Categorías y productos
│   │   │       ├── apariencia/           # Tema y plantilla
│   │   │       ├── analytics/
│   │   │       └── cuenta/
│   │   ├── carta/
│   │   │   ├── layout.tsx        # Fuentes Google (Playfair, DM Sans, Poppins, Lora)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx      # Carta pública SSR
│   │   │       └── not-found.tsx
│   │   ├── auth/callback/        # OAuth / confirmación email
│   │   ├── layout.tsx            # Layout raíz
│   │   ├── page.tsx              # Landing
│   │   └── globals.css           # Tailwind + clases de tipografía por tema
│   ├── components/
│   │   ├── dashboard/            # UI del panel admin
│   │   ├── carta-publica/        # UI de la carta visible al comensal
│   │   │   └── templates/        # elegante | casual | atrevida
│   │   └── shared/               # Formularios, botones, acordeones reutilizables
│   ├── lib/
│   │   ├── supabase/             # client.ts, server.ts, middleware.ts
│   │   ├── data/                 # Queries cacheadas (React cache)
│   │   ├── storage/              # Upload/delete en buckets
│   │   ├── theme/                # CSS vars, defaults, opciones de fuente
│   │   ├── carta/                # Helpers carta pública (precios, redes)
│   │   ├── validations/          # Esquemas Zod
│   │   ├── auth/
│   │   ├── utils/
│   │   └── types.ts              # Tipos de dominio
│   └── middleware.ts             # Refresco de sesión Supabase
├── .env.example
├── DETAILS.md                    # Este archivo
└── package.json
```

---

## 4. Modelo de datos (Supabase / PostgreSQL)

### 4.1 `profiles`

Extiende `auth.users`. Se crea automáticamente con el trigger `handle_new_user` al registrarse.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | = `auth.users.id` |
| `full_name` | text | Nombre del dueño |
| `email` | text | Email |
| `created_at`, `updated_at` | timestamptz | Auditoría |

### 4.2 `restaurants`

Un restaurante por usuario en plan básico/trial.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `owner_id` | uuid FK → profiles | Dueño |
| `name` | text | Nombre visible en la carta |
| `slug` | text UNIQUE | URL pública: `/carta/{slug}` |
| `description` | text | Descripción del negocio |
| `logo_url` | text | URL en bucket `logos` |
| `primary_color` | text | Color legacy del dashboard (`#RRGGBB`) |
| `address` | text | Dirección (pie de carta) |
| `phone` | text | Teléfono (pie de carta) |
| `is_active` | boolean | Si es `false`, la carta pública no se muestra |

**Restricción de slug:** solo minúsculas, números y guiones (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).

### 4.3 `categories`

Secciones del menú (Desayunos, Bebidas, Postres, etc.).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `restaurant_id` | uuid FK | |
| `name` | text | Nombre de la categoría |
| `position` | integer | Orden en el menú regular |
| `is_active` | boolean | Oculta en carta pública si `false` |
| `is_favorite` | boolean | Categoría destacada al inicio |
| `favorite_position` | integer \| null | Orden entre favoritas |

### 4.4 `menu_items`

Productos/platos de la carta.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `category_id` | uuid FK | Categoría padre |
| `restaurant_id` | uuid FK | Denormalizado para queries |
| `name` | text | Nombre del producto |
| `description` | text | Descripción opcional |
| `price` | decimal(10,2) | Precio base (puede ser null si hay variaciones) |
| `variations` | jsonb | Legacy en dashboard: `[{description, price}]` |
| `image_url` | text | Foto en bucket `dish-images` |
| `is_available` | boolean | Agotado / oculto en público si `false` |
| `is_featured` | boolean | Muestra badge destacado |
| `position` | integer | Orden dentro de la categoría |

### 4.5 `item_variations`

Variaciones normalizadas para la carta pública (tamaños, presentaciones).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `menu_item_id` | uuid FK | Producto padre |
| `name` | text | Ej: `500 mls`, `1 lts` |
| `price` | numeric(10,2) | Precio de esa variación |
| `position` | integer | Orden de visualización |
| `is_available` | boolean | |

> Al crear/editar un producto en el dashboard, las variaciones del formulario se sincronizan a esta tabla vía `syncItemVariations()`.

### 4.6 `restaurant_theme`

Configuración visual 1:1 con el restaurante. Se crea automáticamente al insertar un restaurante (`handle_new_restaurant`).

**Plantilla de layout:**

| Valor | Descripción |
|-------|-------------|
| `elegante` | Header centrado, lista vertical, tabs horizontales (default) |
| `casual` | Header horizontal, grid 2 columnas, chips de filtro |
| `atrevida` | Estilo oscuro, sidebar de categorías numerado, lista densa |

**Zonas configurables (colores, toggles, textos):**

| Zona | Campos principales |
|------|-------------------|
| **Encabezado** | `header_bg_color`, `header_bg_image_url`, overlay, `header_name_color`, `header_desc_color`, `logo_border_color`, `show_hours`, `hours_text`, `font_style` |
| **Cuerpo** | `body_bg_color`, `body_bg_image_url`, overlay, tags (`tab_*`), contenedor categoría (`category_*`), tarjetas (`item_*`), badges (`badge_*`), variaciones (`variation_*`) |
| **Pie** | `footer_*`, redes (`show_instagram`, `instagram_url`, etc.), `show_address`, `show_phone` |

**Tipografías (`font_style`):**

| Valor | Fuentes |
|-------|---------|
| `clasica` | Playfair Display + DM Sans |
| `moderna` | Poppins |
| `editorial` | Lora + DM Sans |
| `tecnica` | Monospace |

**Forma de tags (`tab_border_radius`):** `pill` | `rounded` | `square`

### 4.7 `carta_views`

Registro de visitas a la carta pública.

| Columna | Tipo |
|---------|------|
| `restaurant_id` | uuid FK |
| `viewed_at` | timestamptz |
| `user_agent` | text |

### 4.8 `subscriptions`

| Columna | Valores |
|---------|---------|
| `plan` | `trial`, `basic`, `pro`, `premium` |
| `status` | `active`, `expired`, `cancelled` |
| `trial_ends_at`, `current_period_end` | timestamptz |

---

## 5. Autenticación y rutas protegidas

### Clientes Supabase

| Archivo | Uso |
|---------|-----|
| `src/lib/supabase/client.ts` | Client Components (browser) |
| `src/lib/supabase/server.ts` | Server Components y Server Actions (cookies) |
| `src/lib/supabase/middleware.ts` | Refresco de sesión en cada request |

### Rutas

| Ruta | Acceso |
|------|--------|
| `/`, `/login`, `/register` | Público |
| `/carta/[slug]` | Público (anon) |
| `/dashboard/*` | Solo autenticado |
| `/auth/callback` | Callback OAuth |

El `middleware.ts` solo intercepta `/dashboard/*`, `/login` y `/register` para mantener la sesión Supabase actualizada.

### Registro

1. Usuario se registra en `/register`
2. Trigger `handle_new_user` crea fila en `profiles`
3. Al guardar restaurante, `ensureUserProfile()` garantiza que el perfil exista (backfill si falló el trigger)

---

## 6. Flujo: cómo se crea un menú

### Paso 1 — Cuenta y restaurante

1. **Registro** → `/register`
2. **Login** → `/dashboard`
3. **Restaurante** → `/dashboard/restaurante`
   - Nombre, slug, descripción, dirección, teléfono
   - Logo (upload a bucket `logos`)
   - Color primario (dashboard)
   - Server Action: `saveRestaurantAction`
   - Al crear restaurante: insert en `subscriptions` (trial 14 días) + trigger crea `restaurant_theme`

### Paso 2 — Categorías

En `/dashboard/carta`:

1. **Crear categoría** → `createCategoryAction`
   - Nombre, `position` automático al final
2. **Editar** nombre / activar-desactivar → `updateCategoryAction`, `toggleCategoryActiveAction`
3. **Marcar favorita** → `toggleCategoryFavoriteAction` (aparece primero en carta pública)
4. **Reordenar** con drag & drop → `reorderCategoriesAction`, `reorderFavoriteCategoriesAction`
5. **Eliminar** → `deleteCategoryAction` (cascade a productos)

UI: `CategoryManager` → `CategorySection` (acordeón por categoría)

### Paso 3 — Productos

Dentro de cada categoría (`CategorySection`):

1. **Crear producto** → `createMenuItemAction`
   - Campos: nombre, descripción, precio base (opcional), variaciones JSON, imagen
   - Imagen → bucket `dish-images`, path `{userId}/{restaurantId}/{menuItemId}.{ext}`
   - Variaciones → sincronizadas a `item_variations`
2. **Editar** → `updateMenuItemAction`
3. **Eliminar** → `deleteMenuItemAction` (borra imagen de Storage)
4. **Reordenar** (action existe, UI pendiente) → `reorderMenuItemsAction`

UI: `CreateMenuItemForm`, `MenuItemRow` (acordeón por producto), `MenuItemVariationsField`, `ImageUploadField`

### Paso 4 — Apariencia

En `/dashboard/apariencia`:

1. Elegir **plantilla** (`elegante` | `casual` | `atrevida`)
2. Ajustar colores, tipografía, horario, redes, badges
3. Preview en tiempo real (iframe + `postMessage`)
4. **Guardar** → `saveRestaurantThemeAction` (UPSERT en `restaurant_theme`)

### Paso 5 — Publicar

- URL pública: `/carta/{slug}` o `{NEXT_PUBLIC_APP_URL}/carta/{slug}`
- El comensal ve solo categorías activas y productos disponibles
- Cada visita (excepto `?preview=true`) registra fila en `carta_views`

---

## 7. Capa de datos (`src/lib/data`)

### Queries del dashboard (requieren usuario autenticado)

| Función | Archivo | Descripción |
|---------|---------|-------------|
| `getCurrentProfile` | `queries.ts` | Perfil del usuario logueado |
| `getOwnerRestaurant` | `queries.ts` | Restaurante del dueño |
| `getCategoriesWithProducts` | `queries.ts` | Categorías + productos (incluye inactivos) |
| `getRestaurantSubscription` | `queries.ts` | Plan actual |
| `getDashboardStats` | `queries.ts` | Conteos para el panel |
| `getRestaurantTheme` | `theme-queries.ts` | Tema del restaurante |
| `getOwnerRestaurantTheme` | `theme-queries.ts` | Tema + restaurantId del dueño |

### Queries públicas (anon, vía RLS)

| Función | Archivo | Descripción |
|---------|---------|-------------|
| `getRestaurantBySlug` | `public-carta.ts` | Restaurante activo por slug |
| `getPublicCategoriesWithProducts` | `public-carta.ts` | Solo activos/disponibles + `item_variations` |
| `splitPublicCartaCategories` | `public-carta.ts` | Separa favoritas vs regulares |
| `recordCartaView` | `public-carta.ts` | Inserta visita |

### Helpers

| Función | Archivo | Descripción |
|---------|---------|-------------|
| `syncItemVariations` | `item-variations.ts` | Reemplaza variaciones de un producto |
| `ensureUserProfile` | `ensure-profile.ts` | Garantiza profile antes de crear restaurante |
| `getPublicCartaUrl` | `queries.ts` | Construye URL absoluta o relativa |

Todas las queries de lectura usan `cache()` de React para deduplicar en un mismo request SSR.

---

## 8. Dashboard del dueño

### Layout: `DashboardShell`

Sidebar con navegación:

| Ruta | Sección |
|------|---------|
| `/dashboard` | Panel (resumen + stats) |
| `/dashboard/restaurante` | Datos y branding |
| `/dashboard/carta` | Categorías y platos |
| `/dashboard/apariencia` | Tema y plantilla |
| `/dashboard/analytics` | Visitas |
| `/dashboard/cuenta` | Plan y suscripción |

Responsive: menú hamburguesa en móvil.

### Componentes principales del dashboard

| Componente | Responsabilidad |
|------------|-----------------|
| `restaurant-form.tsx` | Formulario CRUD restaurante + logo |
| `logo-upload-field.tsx` | Preview y upload de logo |
| `category-manager.tsx` | Lista de categorías, DnD, favoritas |
| `category-section.tsx` | Acordeón categoría + productos + acciones |
| `create-category-form.tsx` | Alta de categoría |
| `create-menu-item-form.tsx` | Alta de producto con imagen y variaciones |
| `menu-item-row.tsx` | Edición/eliminación de producto (acordeón) |
| `menu-item-variations-field.tsx` | Editor dinámico de variaciones |
| `theme-customizer.tsx` | Panel completo de apariencia + iframe preview |
| `theme-controls/shared.tsx` | Controles reutilizables (color, toggle, range) |
| `stat-card.tsx` | Tarjeta de métrica en el panel |

### Patrones UI del dashboard

- **Server Actions** + `useFormState` / `useFormStatus` para feedback
- **Acordeones** (`shared/accordion.tsx`) para ahorrar espacio vertical
- **Drag & drop** (`@dnd-kit`) solo en categorías (favoritas y regulares por separado)
- Validación Zod en servidor; mensajes de error en español

---

## 9. Carta pública (`/carta/[slug]`)

### Página: `src/app/carta/[slug]/page.tsx`

Server Component que:

1. Resuelve restaurante por `slug` (activo)
2. Carga tema (`restaurant_theme`) y menú público
3. Registra visita (salvo `?preview=true`)
4. Renderiza `CartaThemeRoot` → `CartaTemplateRenderer`

### Árbol de renderizado

```
CartaThemeRoot (inyecta CSS custom properties + contexto de tema)
  └── CartaTemplateRenderer (switch por cart_template)
        ├── EleganteCarta
        ├── CasualCarta
        └── AtrevidaCarta
```

### Componentes compartidos (plantilla Elegante)

| Componente | Descripción |
|------------|-------------|
| `carta-theme-root.tsx` | Div raíz con CSS vars; escucha `postMessage` en preview |
| `carta-theme-context.tsx` | Context + hook `useCartaTheme()` |
| `carta-header.tsx` | Logo circular, nombre, descripción, horario |
| `carta-category-nav.tsx` | Tabs sticky con categoría activa (IntersectionObserver) |
| `carta-menu.tsx` | Orquesta nav + secciones (Destacados + Menú) |
| `carta-category-section.tsx` | Contenedor de categoría con título y acento |
| `carta-menu-item.tsx` | Tarjeta producto: imagen, nombre, precio/variaciones, badge |
| `carta-footer.tsx` | Redes, dirección, teléfono, crédito TuCarta.bo |

### Plantilla Casual (`templates/casual/`)

| Componente | Layout |
|------------|--------|
| `casual-header.tsx` | Fila horizontal: logo cuadrado + nombre/desc/horario |
| `casual-chips.tsx` | Chips scrollables (Todo + categorías) |
| `casual-card.tsx` | Card 2 columnas: imagen arriba, info abajo |
| `casual-carta.tsx` | Orquestador: filtra productos por chip activo |
| `casual-footer.tsx` | Footer compacto con redes |

### Plantilla Atrevida (`templates/atrevida/`)

| Componente | Layout |
|------------|--------|
| `atrevida-header.tsx` | Banner con línea de acento y logo |
| `atrevida-sidebar.tsx` | Tabs verticales numerados (01, 02…) |
| `atrevida-item-list.tsx` | Lista densa sin fotos, precio a la derecha |
| `atrevida-carta.tsx` | Layout sidebar + lista por categoría activa |
| `atrevida-footer.tsx` | Footer oscuro minimal |

### Helpers carta pública (`src/lib/carta/`)

| Archivo | Función |
|---------|---------|
| `item-price.ts` | `getPublicItemPriceLabel()` — precio o rango si hay variaciones |
| `social-links.ts` | `getSocialLinks()` — filtra redes activas del tema |
| `template-types.ts` | Tipo `CartaTemplateProps` compartido |

### Orden de categorías en público

1. Categorías **favoritas** (`is_favorite = true`), ordenadas por `favorite_position`
2. Categorías **regulares**, ordenadas por `position`
3. Solo categorías con al menos un producto disponible

---

## 10. Sistema de personalización (temas y plantillas)

### CSS Custom Properties

`themeToCssVars()` en `src/lib/theme/theme-utils.ts` convierte `RestaurantThemeRow` a variables CSS inyectadas en el div `#carta-theme-root`:

```css
--header-bg, --header-name-color, --tab-active-bg, --item-price-color,
--variation-bg, --footer-text, --social-icon-color, /* ... */
```

Los componentes de la carta **no hardcodean colores**; consumen `var(--token)`.

### Preview en tiempo real

1. Panel en `/dashboard/apariencia` tiene iframe → `/carta/{slug}?preview=true`
2. Cada cambio envía `postMessage` con tipo `CARTA_THEME_PREVIEW` y partial del tema
3. `CartaThemeRoot` en modo preview aplica el patch sin recargar
4. Los cambios **no se persisten** hasta pulsar **Guardar cambios**

### Defaults

`DEFAULT_RESTAURANT_THEME` en `theme-utils.ts` define todos los valores por defecto si no existe fila en BD.

---

## 11. Storage (imágenes)

| Bucket | Uso | Path | Límite |
|--------|-----|------|--------|
| `logos` | Logo del restaurante | `{userId}/{restaurantId}.{ext}` | 3 MB |
| `dish-images` | Fotos de productos | `{userId}/{restaurantId}/{menuItemId}.{ext}` | 3 MB |
| `theme-backgrounds` | Fondos header/body | `{userId}/{restaurantId}/{zone}.{ext}` | 3 MB |

Formatos permitidos: JPEG, PNG, WebP (GIF solo en `dish-images`).

Helpers en `src/lib/storage/{logos,dish-images,theme-backgrounds}.ts`.

---

## 12. Server Actions

### Auth — `src/app/(auth)/actions.ts`

- Login, registro, logout

### Restaurante — `src/app/(dashboard)/dashboard/restaurante/actions.ts`

| Action | Descripción |
|--------|-------------|
| `saveRestaurantAction` | Crear/actualizar restaurante + logo + suscripción trial |

### Carta — `src/app/(dashboard)/dashboard/carta/actions.ts`

| Action | Descripción |
|--------|-------------|
| `createCategoryAction` | Nueva categoría |
| `updateCategoryAction` | Editar nombre/estado |
| `deleteCategoryAction` | Eliminar categoría |
| `reorderCategoriesAction` | Orden de categorías regulares |
| `toggleCategoryActiveAction` | Activar/desactivar |
| `toggleCategoryFavoriteAction` | Marcar/desmarcar favorita |
| `reorderFavoriteCategoriesAction` | Orden de favoritas |
| `createMenuItemAction` | Nuevo producto + imagen + variaciones |
| `updateMenuItemAction` | Editar producto |
| `deleteMenuItemAction` | Eliminar producto + imagen |
| `reorderMenuItemsAction` | Orden dentro de categoría |

### Apariencia — `src/app/(dashboard)/dashboard/apariencia/actions.ts`

| Action | Descripción |
|--------|-------------|
| `saveRestaurantThemeAction` | UPSERT tema + upload fondos |

Todas las mutaciones llaman `revalidatePath()` en las rutas afectadas.

---

## 13. Seguridad (RLS)

Row Level Security habilitado en todas las tablas públicas.

### Principios

- **Nunca** usar `service_role` en el cliente
- El dueño accede vía `auth.uid() = owner_id` (o join equivalente)
- La carta pública usa rol `anon` con políticas de solo lectura filtradas

### Lectura pública (anon)

| Tabla | Condición |
|-------|-----------|
| `restaurants` | `is_active = true` |
| `categories` | `is_active = true` + restaurante activo |
| `menu_items` | `is_available = true` + restaurante activo |
| `item_variations` | `is_available = true` + producto disponible |
| `restaurant_theme` | Sin restricción (necesario para renderizar estilos) |

### Escritura pública

| Tabla | Quién |
|-------|-------|
| `carta_views` | `anon` + `authenticated` pueden insertar visitas |

### Dueño (authenticated)

CRUD completo en sus propias filas de `restaurants`, `categories`, `menu_items`, `item_variations`, `restaurant_theme`, `subscriptions`.

---

## 14. Planes y límites de negocio

| Plan | Precio/mes | Platos | Fotos | Analytics | Sucursales |
|------|------------|--------|-------|-----------|------------|
| Trial | Gratis | 30 | Sí | Básico | 1 |
| Básico | $7 USD | 30 | No | Básico | 1 |
| Pro | $18 USD | ∞ | Sí | Completo | 1 |
| Premium | $35 USD | ∞ | Sí | Completo | 5 |

> Los límites por plan están definidos en las reglas de negocio; la validación en código según plan está **pendiente de implementar**.

---

## 15. Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=          # URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=  # Clave pública (anon/publishable)
SUPABASE_SERVICE_ROLE_KEY=         # Solo servidor; nunca al cliente
RESEND_API_KEY=                    # Email (futuro)
NEXT_PUBLIC_APP_URL=               # Ej: https://tucarta.bo (URLs absolutas del QR)
```

---

## 16. Migraciones SQL (orden de ejecución)

Ejecutar en **Supabase SQL Editor** en este orden:

| # | Archivo | Contenido |
|---|---------|-----------|
| 1 | `20250527000000_create_profiles_and_restaurants.sql` | profiles, restaurants, RLS, trigger usuario |
| 2 | `20250528000000_create_menu_and_subscriptions.sql` | categories, menu_items, carta_views, subscriptions |
| 3 | `20250529000000_create_logos_storage.sql` | Bucket logos + políticas |
| 4 | `20250530000000_fix_profiles_insert.sql` | Fix INSERT profiles |
| 5 | `20250530000001_add_updated_at_columns.sql` | updated_at + triggers |
| 6 | `20250531000000_categories_favorites.sql` | is_favorite, favorite_position |
| 7 | `20250532000000_menu_items_variations.sql` | Columna variations JSONB |
| 8 | `20250533000000_create_dish_images_storage.sql` | Bucket dish-images |
| 9 | `20250534000000_restaurant_theme_item_variations.sql` | restaurant_theme, item_variations, address/phone, is_featured |
| 10 | `20250535000000_cart_template.sql` | Columna cart_template |

---

## Tipos TypeScript principales (`src/lib/types.ts`)

| Tipo | Uso |
|------|-----|
| `ProfileRow` | Usuario extendido |
| `RestaurantRow` | Negocio |
| `RestaurantThemeRow` | Tema visual completo |
| `CartTemplate` | `elegante` \| `casual` \| `atrevida` |
| `CategoryRow` | Categoría del menú |
| `CategoryWithProducts` | Categoría + `menu_items[]` |
| `MenuItemRow` | Producto con `variations` (dashboard) e `item_variations` (público) |
| `ItemVariationRow` | Variación normalizada en BD |
| `SubscriptionRow` | Plan de suscripción |
| `DashboardStats` | Métricas del panel |
| `PublicCartaPayload` | Payload agregado para carta pública |

---

## Desarrollo local

```bash
pnpm install
cp .env.example .env   # Completar credenciales Supabase
pnpm dev               # http://localhost:3000
pnpm build             # Verificar tipos y build
pnpm lint              # ESLint
```

---

## Pendiente / fuera de scope actual

- Carta pública con registro de pedidos o pagos
- Límites por plan aplicados en código (30 platos, fotos según plan)
- Drag & drop de productos en UI (action ya existe)
- Generación y descarga de QR desde el dashboard
- Dominio personalizado por restaurante
- App nativa iOS/Android
- Multilenguaje en carta pública

---

*Documento generado para el proyecto Carta (TuCarta.bo). Actualizar cuando cambien esquema, rutas o componentes.*
