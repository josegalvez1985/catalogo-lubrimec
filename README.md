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
- `GET ${API_BASE}/josegalvez/paginaweb/marcas`
- `GET ${API_BASE}/josegalvez/paginaweb/viscosidades`

## Comportamiento de la app

- Muestra un hero con información del lubricentro.
- Permite buscar productos por texto, marca y rubro.
- Permite filtrar artículos por rubro, viscosidad y marca.
- Tiene paginación local con 16 artículos por carga.
- Si el endpoint de rubros falla, usa el fixture local `src/data/rubros.ts`.

## Cambios recientes (20 de abril de 2026)

- Se agregó soporte de filtro de marcas usando la API de `marcas`.
- La lista de marcas y viscosidades ahora se actualiza de forma cruzada: al seleccionar una viscosidad solo se muestran marcas válidas, y viceversa.
- El buscador ahora indexa también nombre de marca y rubro.
- Se añadió un botón "X" en el campo de búsqueda para limpiar rápidamente la búsqueda.
- Se incorporó una barra de progreso indeterminada mientras se cargan las APIs remotas.
- Se mejoró el comportamiento del copiado de producto con un spinner y estado de carga.
- Se movió el número de WhatsApp a `src/lib/config.ts` para configuración centralizada.
- Se agregó un `meta name="theme-color"` para mejorar la experiencia móvil.
- Se corrigieron bugs en el resaltado de texto de búsqueda (`HighlightText`) y en la navegación 404.

## Notas adicionales

- La app usa `BrowserRouter` de React Router.
- El listado de productos se renderiza mediante el componente `ArticleCard`.
- El archivo `src/lib/config.ts` centraliza la configuración del backend.

---

© 2026 Lubrimec