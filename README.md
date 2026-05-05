# Lubrimec — Sitio Web

Sitio web e-commerce/catálogo de **LUBRIMEC**, lubricentro ubicado en Capiatá, Paraguay. Construido como Single Page Application (SPA) con soporte PWA (instalable y con caché offline).

## Descripción

Sitio web multi-página con navegación moderna que incluye landing, información institucional, catálogo de productos con búsqueda y filtros, cotizador interactivo de mantenimiento y formulario de contacto. Consume datos remotos desde una API de Oracle APEX y usa un fallback local de rubros cuando la API no está disponible.

## Tecnologías

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix UI primitives)
- **React Router v6** (navegación multi-página)
- **React Query** (server state)
- **Framer Motion** (animaciones)
- **Lucide Icons**
- **PWA** (Service Worker + Web Manifest)

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
│   └── PwaInstallButton.tsx # Botón de instalación PWA
├── pages/
│   ├── Home.tsx             # Landing
│   ├── Nosotros.tsx         # Acerca de la empresa
│   ├── Servicios.tsx        # Detalle de servicios
│   ├── Catalogo.tsx         # Catálogo de productos (búsqueda + filtros)
│   ├── Cotizador.tsx        # Cotizador de mantenimiento (4 pasos)
│   ├── Contacto.tsx         # Contacto + FAQ
│   └── NotFound.tsx
├── hooks/
│   ├── useArticulos.tsx     # Fetch de productos
│   ├── useRubros.tsx        # Fetch de rubros (con fallback local)
│   ├── useMarcas.tsx        # Fetch de marcas
│   └── useViscosidades.tsx  # Fetch de viscosidades
├── lib/
│   ├── config.ts            # API_BASE y WHATSAPP_NUMBER
│   ├── productCanvas.ts     # Genera imagen para compartir productos
│   └── utils.ts
└── data/
    └── rubros.ts            # Fallback local de rubros
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
- Wizard de 4 pasos: vehículo → tipo de aceite → extras → cotización final.
- Multiplicador de precio por cilindrada del motor.
- Genera mensaje formateado y abre WhatsApp con la cotización detallada.

### Contacto (`/contacto`)
- Formulario validado que abre WhatsApp con el mensaje formateado (sin backend).
- Mapa de Google Maps embebido.
- Sección de FAQ con acordeón animado.

### PWA
- Instalable en móvil y desktop (botón de instalación contextual).
- Service Worker (`public/sw.js`) con estrategia network-first para HTML y cache-first para assets.
- Soporte iOS (instrucciones para "Añadir a pantalla de inicio").

## Despliegue

El sitio se despliega automáticamente en GitHub Pages mediante GitHub Actions (`.github/workflows/deploy.yml`) en cada push a `main`.

**URL de producción:** [https://josegalvez.github.io/catalogo-lubrimec/](https://josegalvez.github.io/catalogo-lubrimec/)

> El `basename` del router está fijado a `/catalogo-lubrimec` en `src/App.tsx`. Si cambia el path de despliegue, también hay que actualizar `vite.config.ts` (`base`) y `public/manifest.webmanifest` (`start_url` / `scope`).

## Notas adicionales

- La app usa `BrowserRouter` de React Router con `basename="/catalogo-lubrimec"`.
- El layout (Navbar + Footer) es compartido por todas las rutas y se define en `App.tsx`.
- `ScrollToTop` resetea el scroll al cambiar de ruta.
- El número de WhatsApp y API base están centralizados en `src/lib/config.ts`.

---

© 2026 Lubrimec — Capiatá, Paraguay
