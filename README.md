# Catálogo Lubrimec

Aplicación web de catálogo de productos para **LUBRIMEC**.

## Descripción

Esta app muestra un catálogo de artículos con búsqueda y filtros por rubro. Consume datos remotos desde una API de Oracle APEX y usa un fallback local de rubros cuando la API no está disponible.

## Tecnologías

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-ui
- React Router
- React Query
- Framer Motion
- Lucide Icons

## Estructura principal

- `src/App.tsx` — Router principal y proveedor de React Query
- `src/pages/Index.tsx` — Página de catálogo con búsqueda y filtros
- `src/hooks/useRubros.tsx` — Hook para cargar rubros/categorías
- `src/hooks/useArticulos.tsx` — Hook para cargar artículos
- `src/lib/config.ts` — Configuración de la base URL de la API
- `src/data/rubros.ts` — Datos locales de rubros para fallback

## Cómo ejecutar el proyecto

Instala dependencias:

```sh
npm install
```

Inicia el servidor de desarrollo:

```sh
npm run dev
```

Compila para producción:

```sh
npm run build
```

Lanza una vista previa del build:

```sh
npm run preview
```

Ejecuta tests:

```sh
npm run test
```

## Configuración de la API

La base URL de la API se define en `src/lib/config.ts` con la constante `API_BASE`.

- En desarrollo se usa por defecto `/ords` para aprovechar el proxy de Vite y evitar CORS.
- En producción se usa por defecto `https://oracleapex.com/ords`.

Puedes sobrescribir la URL mediante la variable de entorno `VITE_API_BASE`.

Ejemplos:

`.env` (desarrollo):

```env
VITE_API_BASE=/ords
```

`.env.production` (producción):

```env
VITE_API_BASE=https://oracleapex.com/ords
```

### Endpoints usados

- `GET ${API_BASE}/josegalvez/paginaweb/rubros`
- `GET ${API_BASE}/josegalvez/paginaweb/articulossinimg`

## Comportamiento de la app

- Muestra un hero con información del lubricentro.
- Permite buscar productos por texto.
- Permite filtrar artículos por rubro.
- Tiene paginación local con 50 artículos por página.
- Si el endpoint de rubros falla, usa el fixture local `src/data/rubros.ts`.

## Notas adicionales

- La app usa `BrowserRouter` de React Router.
- El listado de productos se renderiza mediante el componente `ArticleCard`.
- El archivo `src/lib/config.ts` centraliza la configuración del backend.

---

© 2026 Lubrimec