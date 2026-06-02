# Lubrimec — Sitio Web

Sitio web e-commerce/catálogo de **LUBRIMEC**, lubricentro ubicado en Capiatá, Paraguay. Construido como Single Page Application (SPA) con React.

## Descripción

Sitio web multi-página con navegación moderna que incluye landing, información institucional, catálogo de productos con búsqueda y filtros, cotizador interactivo de mantenimiento y formulario de contacto. Consume datos remotos desde una API de Oracle APEX y usa un fallback local de rubros, marcas y viscosidades cuando la API no está disponible.

> **Sin caché ni almacenamiento de datos.** La app está configurada para consultar siempre los endpoints en fresco: React Query no retiene datos entre navegaciones y no hay Service Worker. Lo único que se persiste es la preferencia de tema (claro/oscuro) en `localStorage`.

## Tecnologías

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix UI primitives)
- **React Router v6** (navegación multi-página)
- **React Query** (server state, configurado sin caché)
- **Framer Motion** (animaciones)
- **Lucide Icons**

## Páginas y rutas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | **Inicio** | Landing con hero animado, servicios, CTAs y mapa |
| `/nosotros` | **Nosotros** | Historia, misión/visión/valores, stats, equipo |
| `/servicios` | **Servicios** | 6 servicios con precios "desde", proceso de trabajo |
| `/catalogo` | **Catálogo** | Listado de productos con búsqueda y filtros (rubro, marca, viscosidad) |
| `/cotizador` | **Cotizador** | Formulario multi-paso para cotizar mantenimiento (envía a WhatsApp) |
| `/contacto` | **Contacto** | Formulario, métodos de contacto, mapa embed, horarios y FAQ |
| `*` | **404** | Página no encontrada |

## Estructura principal

```
src/
├── App.tsx                  # Router + Layout (Navbar + Footer compartidos)
├── components/
│   ├── Navbar.tsx           # Navegación responsive con drawer móvil
│   ├── Footer.tsx           # Footer compartido
│   ├── ArticleCard.tsx      # Card de producto en el catálogo
│   ├── ProductModal.tsx     # Modal de detalle de producto
│   ├── QuotationModal.tsx   # Modal de cotización con imagen exportable
│   └── PwaInstallButton.tsx # Botón de instalación (en desuso: ya no hay Service Worker)
├── pages/
│   ├── Home.tsx             # Landing
│   ├── Nosotros.tsx         # Acerca de la empresa
│   ├── Servicios.tsx        # Detalle de servicios
│   ├── Catalogo.tsx         # Catálogo de productos (búsqueda + filtros)
│   ├── Cotizador.tsx        # Cotizador de mantenimiento (multi-paso)
│   ├── Contacto.tsx         # Contacto + FAQ
│   └── NotFound.tsx
├── hooks/
│   ├── useArticulos.tsx     # Fetch de productos
│   ├── useRubros.tsx        # Fetch de rubros (con fallback local)
│   ├── useMarcas.tsx        # Fetch de marcas (con fallback local)
│   ├── useViscosidades.tsx  # Fetch de viscosidades (con fallback local)
│   └── useTheme.tsx         # Tema claro/oscuro (persiste en localStorage)
├── lib/
│   ├── config.ts            # API_BASE y WHATSAPP_NUMBER
│   ├── productCanvas.ts     # Genera imagen para compartir productos
│   ├── quotationCanvas.ts   # Tipos/utilidades de la imagen de cotización
│   └── utils.ts
└── data/
    ├── rubros.ts            # Fallback local de rubros
    ├── marcas.ts            # Fallback local de marcas
    ├── viscosidades.ts      # Fallback local de viscosidades
    └── products.ts          # Datos de ejemplo de productos
```

## Cómo ejecutar el proyecto

Instalar dependencias:

```sh
npm install
```

Iniciar el servidor de desarrollo:

```sh
npm run dev
```

Compilar para producción:

```sh
npm run build
```

Lanzar una vista previa del build:

```sh
npm run preview
```

Ejecutar tests:

```sh
npm run test
```

Lint:

```sh
npm run lint
```

## Configuración de la API

La base URL de la API se define en `src/lib/config.ts` con la constante `API_BASE`.

- En desarrollo se usa por defecto `/ords` para aprovechar el proxy de Vite y evitar CORS.
- En producción se usa por defecto `https://oracleapex.com/ords`.

Puedes sobrescribir la URL mediante la variable de entorno `VITE_API_BASE`.

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
- `GET ${API_BASE}/josegalvez/paginaweb/articulosimg/{id}` — Imagen binaria del producto

## Funcionalidades destacadas

### Catálogo (`/catalogo`)
- Búsqueda con debounce (300ms) por descripción, marca y rubro.
- Filtros cruzados: al seleccionar un rubro, sólo se muestran las marcas y viscosidades aplicables; ídem para viscosidad y marca.
- Paginación local con 16 artículos por carga ("Cargar más").
- Chips de filtros activos con cierre rápido y "Limpiar todo".
- Modal de producto con navegación por teclado y swipe móvil.
- Botón "Copiar imagen del producto" que genera un PNG con marca, precio y stock.
- Sincronización de filtros con URL (`?q=&rubro=&marca=&viscosidad=`).

### Cotizador (`/cotizador`)
- Wizard de pasos: vehículo → viscosidad/marca → existencia → cantidad y descuento → aceites → filtros → cotización.
- Selector de **existencia**: "Con Stock" filtra por disponibilidad; "Todos" muestra todo sin controlar stock.
- Campo de **descuento %** con valor por defecto **30** (editable, 0–100).
- Consulta los precios y el descuento aplicado a la API de Oracle APEX.
- Modal de cotización con imagen exportable:
  - **Descargar** PNG en máxima resolución (`pixelRatio` dinámico para no exceder los límites de canvas del navegador).
  - **Copiar** al portapapeles con ancho acotado (~1080px) para que WhatsApp no recomprima tan agresivamente el texto al pegar.
- Genera mensaje formateado y abre WhatsApp con la cotización detallada.

### Contacto (`/contacto`)
- Formulario validado que abre WhatsApp con el mensaje formateado (sin backend).
- Mapa de Google Maps embebido.
- Sección de FAQ con acordeón animado.

### Datos siempre frescos (sin caché)
- **React Query** configurado con `staleTime: 0` y `gcTime: 0` (`refetchOnMount: "always"`): cada montaje y navegación re-consulta los endpoints.
- **No hay Service Worker.** `public/sw.js` es un "kill switch" que se auto-desinstala y borra cualquier caché de PWA antigua en dispositivos que ya la tenían instalada; `src/main.tsx` también desregistra Service Workers previos y limpia `caches` al cargar.
- Lo único que se persiste localmente es la preferencia de tema (`localStorage`).

## Despliegue

El sitio se despliega automáticamente en GitHub Pages mediante GitHub Actions (`.github/workflows/deploy.yml`) en cada push a `main`.

**URL de producción:** [https://josegalvez.github.io/catalogo-lubrimec/](https://josegalvez.github.io/catalogo-lubrimec/)

> El `basename` del router está fijado a `/catalogo-lubrimec` en `src/App.tsx`. Si cambia el path de despliegue, también hay que actualizar `vite.config.ts` (`base`).

### Routing en GitHub Pages (404 SPA)

GitHub Pages no conoce las rutas de React Router, por lo que al recargar o entrar directo a una sub-ruta (p. ej. `/catalogo-lubrimec/cotizador`) devolvería 404. Para resolverlo:

- `public/404.html` guarda la ruta solicitada en un query y redirige al `index.html`.
- Un script en el `<head>` de `index.html` decodifica ese query y restaura la URL real antes de que arranque React Router.

## Notas adicionales

- La app usa `BrowserRouter` de React Router con `basename="/catalogo-lubrimec"`.
- El layout (Navbar + Footer) es compartido por todas las rutas y se define en `App.tsx`.
- `ScrollToTop` resetea el scroll al cambiar de ruta.
- El número de WhatsApp y API base están centralizados en `src/lib/config.ts`.

---

© 2026 Lubrimec — Capiatá, Paraguay
