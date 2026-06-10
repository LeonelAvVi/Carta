# Carta

Proyecto Next.js 14 con App Router, TypeScript y Tailwind CSS.

## Estructura

```
src/
├── app/                  # App Router
│   ├── layout.tsx        # Layout raíz
│   ├── page.tsx          # Página principal (/)
│   └── globals.css       # Estilos globales
└── components/           # Componentes reutilizables
```

## Comenzar

Instalar dependencias:

```bash
pnpm install
```

Servidor de desarrollo:

```bash
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev` — desarrollo
- `pnpm build` — build de producción
- `pnpm start` — servidor de producción
- `pnpm lint` — ESLint
