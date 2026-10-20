# Lubrimec — Sitio Web

Sitio web e-commerce/catálogo de **LUBRIMEC**, lubricentro ubicado en Capiatá, Paraguay. Construido como Single Page Application (SPA) con React.

**Producción:** [https://www.lubrimec.shop](https://www.lubrimec.shop)

## Descripción

Sitio web multi-página con landing, información institucional, catálogo de productos con búsqueda y filtros, carrito, armador de pedidos mayoristas, cotizador de mantenimiento, formulario de contacto y un asistente con chat. Consume datos remotos desde una API de Oracle APEX (ORDS) y usa un fallback local de rubros, marcas y viscosidades cuando la API no está disponible. Los pedidos y consultas se envían por WhatsApp: no hay pago en línea ni usuarios.

## Tecnologías

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix UI primitives)
- **React Router v6** (navegación multi-página)
- **React Query** (server state, caché de 5 minutos)
- **Framer Motion** (animaciones)
- **Lucide Icons**
- **Oracle APEX / ORDS** de backend (scripts en `sql/`)

## Páginas y rutas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | **Inicio** | Landing con hero animado, servicios, CTAs y mapa |
| `/nosotros` | **Nosotros** | Historia, misión/visión/valores, stats, equipo |
| `/servicios` | **Servicios** | 6 servicios con precios "desde", proceso de trabajo |
| `/catalogo` | **Catálogo** | Listado de productos con búsqueda y filtros (rubro, marca, viscosidad) |
| `/cotizador` | **Cotizador** | Formulario multi-paso para cotizar mantenimiento (envía a WhatsApp) |
| `/mayorista` | **Pedido mayorista** | Armador de pedidos por volumen con imagen exportable |
| `/carrito` | **Carrito** | Pedido minorista armado desde el catálogo (envía a WhatsApp) |
| `/contacto` | **Contacto** | Formulario, métodos de contacto, mapa embed, horarios y FAQ |
| `*` | **404** | Página no encontrada |

El **asistente** no es una ruta: es un botón flotante en todas las páginas (ver más abajo).

## Estructura principal

```
src/
├── App.tsx                      # Router + Layout (Navbar + Footer + Asistente compartidos)
├── components/
│   ├── Navbar.tsx               # Navegación responsive con drawer móvil
│   ├── Footer.tsx               # Footer compartido (horarios y contador de visitas)
│   ├── ArticleCard.tsx          # Card de producto en el catálogo
│   ├── FilterSidebar.tsx        # Filtros del catálogo (panel lateral / hoja en móvil)
│   ├── ProductModal.tsx         # Modal de detalle de producto
│   ├── QuotationModal.tsx       # Modal de cotización con imagen exportable
│   ├── PedidoMayoristaModal.tsx # Documento del pedido mayorista (descargar / copiar / WhatsApp)
│   ├── Asistente.tsx            # Botón flotante y chat del asistente
│   ├── Markdown.tsx             # Renderer de las respuestas del asistente
│   ├── SeoMeta.tsx              # Título y descripción por ruta al navegar
│   └── PwaInstallButton.tsx     # Botón de instalación (en desuso: ya no hay Service Worker)
├── pages/
│   ├── Home.tsx                 # Landing
│   ├── Nosotros.tsx             # Acerca de la empresa
│   ├── Servicios.tsx            # Detalle de servicios
│   ├── Catalogo.tsx             # Catálogo de productos (búsqueda + filtros)
│   ├── Cotizador.tsx            # Cotizador de mantenimiento (multi-paso)
│   ├── Mayorista.tsx            # Armador de pedidos mayoristas
│   ├── Carrito.tsx              # Carrito minorista
│   ├── Contacto.tsx             # Contacto + FAQ
│   └── NotFound.tsx
├── hooks/
│   ├── useArticulos.tsx         # Fetch de productos
│   ├── useRubros.tsx            # Fetch de rubros (con fallback local)
│   ├── useMarcas.tsx            # Fetch de marcas (con fallback local)
│   ├── useViscosidades.tsx      # Fetch de viscosidades (con fallback local)
│   ├── useCart.tsx              # Carrito minorista (localStorage)
│   ├── useListaMayorista.tsx    # Pedido mayorista (localStorage)
│   ├── useVisitas.tsx           # Contador de visitas del footer
│   └── useTheme.tsx             # Tema claro/oscuro (persiste en localStorage)
├── lib/
│   ├── config.ts                # API_BASE, WHATSAPP_NUMBER, descuentos y ASISTENTE_HABILITADO
│   ├── asistente.ts             # Conversación del asistente, pedido al backend y guía del sitio
│   ├── seo.ts                   # Título y descripción de cada página (build + SeoMeta)
│   ├── salesRanking.ts          # Badges de "más vendidos" del catálogo
│   ├── productCanvas.ts         # Genera imagen para compartir productos
│   ├── quotationCanvas.ts       # Tipos/utilidades de la imagen de cotización
│   ├── pngExport.ts             # Captura de un nodo del DOM a PNG (pedido mayorista)
│   ├── imageCache.ts            # Caché en memoria de imágenes, solo para la pestaña abierta
│   └── utils.ts
└── data/
    ├── negocio.ts               # Horarios, servicios y preguntas frecuentes (páginas + asistente)
    ├── rubros.ts                # Fallback local de rubros
    ├── marcas.ts                # Fallback local de marcas
    ├── viscosidades.ts          # Fallback local de viscosidades
    └── products.ts              # Datos de ejemplo de productos

sql/                             # Scripts de Oracle (SQL Workshop > SQL Scripts)
├── visitas.sql                  # Contador de visitas
├── asistente-vistas.sql         # Vistas que lee el asistente
└── asistente.sql                # Paquete, tablas y endpoint del asistente
```

### Datos del negocio

Horarios, servicios (con sus precios "desde") y preguntas frecuentes están en `src/data/negocio.ts`. Los usan Contacto, Servicios, el Footer y el asistente: un cambio ahí se ve en todos lados con el próximo deploy.

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

La base URL de la API se define en `src/lib/config.ts` con la constante `API_BASE`, que toma la variable de entorno `VITE_API_BASE`:

| Archivo | Cuándo | Valor |
|---------|--------|-------|
| `.env.development` | `npm run dev` | `/ords` (proxy de Vite a oracleapex.com, para evitar CORS) |
| `.env` | build de producción | `https://oracleapex.com/ords` |

Sin la variable, `config.ts` usa los mismos valores por defecto.

### Endpoints usados

Todos bajo `${API_BASE}/josegalvez/paginaweb/`:

- `GET rubros`, `GET marcas`, `GET viscosidades` — Filtros del catálogo.
- `GET articulossinimg?cod_empresa=24&es_activo=N` — Productos (paginado con `next.$ref`).
- `GET articulosimg/{id}` — Imagen binaria del producto.
- `GET cotizaModelos`, `cotizaMarcas`, `aceites`, `filtroaceite/{modelo}`, `filtroaire/{modelo}`, `filtrocombustible/{modelo}`, `filtrocaja/{modelo}`, `cotizacion/...` — Cotizador.
- `GET|POST visitas?cod_empresa=24` — Contador de visitas del footer, único y acumulado (`{"total"}`, arranca en 1865). El POST suma una visita y se hace una vez por sesión del navegador. Tabla y handlers en `sql/visitas.sql`.
- `POST asistente` — Asistente del sitio (body JSON como `text/plain`, sin preflight). Ver [Asistente](#asistente-botón-flotante-todas-las-páginas).

## Funcionalidades destacadas

### Catálogo (`/catalogo`)
- Búsqueda con debounce (300ms) por descripción, marca y rubro.
- Filtros cruzados: al seleccionar un rubro, sólo se muestran las marcas y viscosidades aplicables; ídem para viscosidad y marca.
- Paginación local con 16 artículos por carga ("Cargar más").
- Chips de filtros activos con cierre rápido y "Limpiar todo".
- Modal de producto con navegación por teclado y swipe móvil.
- Botón "Copiar imagen del producto" que genera un PNG con marca, precio y stock.
- Badges de "más vendidos" (`src/lib/salesRanking.ts`).
- **Descuento fijo del 40%** sobre el precio de lista (`DESCUENTO_PORCENTAJE` en `src/lib/config.ts`): se muestran los dos precios.
- Sincronización de filtros con URL (`?q=&rubro=&marca=&viscosidad=`).

### Carrito (`/carrito`)
- Se arma desde el catálogo ("Agregar"); no deja pasar del stock disponible.
- Se guarda en `localStorage` (`lubrimec_cart`) y se envía por WhatsApp.

### Cotizador (`/cotizador`)
- Wizard de pasos: vehículo → viscosidad/marca → existencia → cantidad y descuento → aceites → filtros → cotización.
- Selector de **existencia**: "Con Stock" filtra por disponibilidad; "Todos" muestra todo sin controlar stock.
- **Descuento fijo del 40%** (no editable), compartido con el catálogo.
- Consulta los precios y el descuento aplicado a la API de Oracle APEX.
- Modal de cotización con imagen exportable:
  - **Descargar** PNG en máxima resolución (`pixelRatio` dinámico para no exceder los límites de canvas del navegador).
  - **Copiar** al portapapeles con ancho acotado (~1080px) para que WhatsApp no recomprima tan agresivamente el texto al pegar.
- Genera mensaje formateado y abre WhatsApp con la cotización detallada.

### Pedido mayorista (`/mayorista`)
- Armador de pedidos pensado para quien compra por volumen: lista densa de filas (foto, precio, stock) en vez de tarjetas, para elegir muchos productos rápido.
- Un toque en la fila agrega el producto; la cantidad se **escribe** en el campo del stepper (pedir 24 unidades no requiere 24 clics).
- Panel "Mi pedido" fijo a la derecha en escritorio; en móvil es una barra inferior que abre una hoja con el mismo panel.
- Pedir más que el stock actual está permitido (se avisa en la fila): el stock es una referencia, el pedido se confirma por WhatsApp.
- El pedido se guarda en `localStorage` (`lubrimec_lista_mayorista`), separado del carrito minorista para que vaciar uno no borre el otro.
- Modal con el documento del pedido (tipo remito, con número y fecha) y tres salidas: **Descargar** PNG, **Copiar** al portapapeles y **Enviar** por WhatsApp.
- Descuento en `DESCUENTO_MAYORISTA` (`src/lib/config.ts`). Hoy es 40%, igual que el minorista, pero se declara aparte para poder moverlo sin tocar el catálogo.
- Entradas al armador: menú principal y footer, más un enlace en el banner de descuento del catálogo.

### Contacto (`/contacto`)
- Formulario validado que abre WhatsApp con el mensaje formateado (sin backend).
- Mapa de Google Maps embebido.
- Horarios y sección de FAQ con acordeón animado (datos de `src/data/negocio.ts`).

### Asistente (botón flotante, todas las páginas)

Chat para clientes: productos, precios, stock, filtros por vehículo, servicios, horarios y cómo usar el sitio. En escritorio es una tarjeta abajo a la derecha que sigue abierta al navegar; en el celular, una hoja. Los enlaces de las respuestas (por ejemplo "ver en el catálogo") abren la página dentro del sitio.

**Cómo funciona**

```
Sitio (React)                      Oracle (ORDS + PL/SQL)                  API de Claude
POST paginaweb/asistente ───────►  PKG_PW_IA.preguntar
{pregunta, historial, pantalla,    límites del día + arma las
 dispositivo, descuento, guia}     instrucciones ─────────────────────►  messages (Haiku)
                                                    ◄── pide una búsqueda
                                   SELECT fijo sobre V_PW_IA_* ───────►  (hasta 5 vueltas)
                                                    ◄── texto final
◄──────────────────────────────    {respuesta, usadas_hoy, limite}
                                   registra todo en PW_IA_CONSULTAS
```

- **La clave de la API nunca llega al navegador**: vive en `PW_IA_CONFIG` y la usa Oracle con `APEX_WEB_SERVICE`.
- **La IA no ve tablas ni escribe SQL.** Solo tiene cuatro búsquedas fijas que devuelven registros del catálogo público (lo mismo que ya muestra el sitio):

  | Búsqueda | Devuelve |
  |----------|----------|
  | `buscar_productos` | Productos por texto, rubro, marca, viscosidad o stock: precio de lista, precio web y stock |
  | `ver_categorias` | Rubros, marcas y viscosidades, con cuántos productos hay |
  | `buscar_vehiculo` | Los modelos que conoce el cotizador |
  | `repuestos_para_vehiculo` | Los filtros compatibles con un modelo, con precio y stock |

  Leen de las vistas `V_PW_IA_*` (`sql/asistente-vistas.sql`), armadas con el mismo SQL de los endpoints del catálogo y del cotizador. Los errores de Oracle no se le pasan a la IA.
- **Lo que sabe del negocio** sale de `armarGuia()` (`src/lib/asistente.ts`), con los datos de `src/data/negocio.ts`: un cambio de horario o precio llega con el deploy, sin tocar Oracle.
- **No hay usuarios**: cada dispositivo (navegador) lleva un id anónimo en `localStorage` (`lubrimec_dispositivo`) y tiene **30 preguntas por día**. Además hay un tope total por día (100) que frena el gasto. Las que fallan no cuentan.
- La conversación vive solo en memoria: recargar la página la borra.
- Cada pregunta queda en `PW_IA_CONSULTAS`: dispositivo, IP, página, pregunta, respuesta, búsquedas y tokens.

**Ponerlo en marcha**

1. SQL Workshop → SQL Scripts → `sql/asistente-vistas.sql`. Al final muestra cuántas filas tiene cada vista.
2. SQL Scripts → `sql/asistente.sql` (idempotente).
3. SQL Commands → cargar la clave y probar (la clave nunca va en un archivo del repo):
   ```sql
   BEGIN PKG_PW_IA.fijar_clave('sk-ant-...'); END;
   BEGIN PKG_PW_IA.probar; END;
   ```
4. Probar las búsquedas sin gastar tokens:
   ```sql
   BEGIN PKG_PW_IA.probar_herramienta('buscar_productos', '{"texto":"20w50"}'); END;
   BEGIN PKG_PW_IA.probar_herramienta('buscar_vehiculo', '{"texto":"hilux"}'); END;
   ```
5. `ASISTENTE_HABILITADO` (`src/lib/config.ts`) hoy lo muestra solo con `npm run dev`. Para producción se pasa a `true` y se hace push.

**Configuración** (`PW_IA_CONFIG`, se cambia con `UPDATE` y `COMMIT`, sin volver a correr el script): `MODELO` (`claude-haiku-5-5`), `ESFUERZO` (`low` / `medium` / `high`), `LIMITE_DISPOSITIVO` (30), `LIMITE_TOTAL` (100).

**Costo por mes** (la cuenta de la API, US$ 5/mes, es compartida con ethos):

```sql
SELECT TRUNC(fecha, 'MM') mes, COUNT(*) preguntas,
       ROUND((SUM(tokens_entrada) * 0.10 + SUM(tokens_cache_leidos) * 0.01
            + SUM(tokens_cache_escritos) * 0.125 + SUM(tokens_salida) * 0.50) / 1e6, 2) dolares
  FROM pw_ia_consultas GROUP BY TRUNC(fecha, 'MM') ORDER BY 1;
```

Si se cambia un endpoint de `rubros` o `viscosidades`, o el SQL de productos o filtros, se vuelve a correr `sql/asistente-vistas.sql`.

### Datos y caché
- **React Query** con caché de 5 minutos (`staleTime`) y 10 en memoria (`gcTime`), sin recargar al volver a la pestaña: un producto nuevo cargado en APEX aparece a los ~5 minutos o al recargar.
- Las imágenes de productos se guardan en memoria solo mientras la pestaña está abierta (`src/lib/imageCache.ts`).
- **No hay Service Worker.** `public/sw.js` es un "kill switch" que se auto-desinstala y borra cualquier caché de PWA antigua en dispositivos que ya la tenían instalada; `src/main.tsx` también desregistra Service Workers previos y limpia `caches` al cargar.
- En `localStorage` se guardan: el tema (`lubrimec-theme`), el carrito (`lubrimec_cart`), el pedido mayorista (`lubrimec_lista_mayorista` y `lubrimec_mayorista_cliente`) y el id del dispositivo para el asistente (`lubrimec_dispositivo`). En `sessionStorage`, si la visita ya se contó.

## Despliegue

El sitio se despliega automáticamente en GitHub Pages mediante GitHub Actions (`.github/workflows/deploy.yml`) en cada push a `main`, con el dominio propio **www.lubrimec.shop** (`public/CNAME`).

Se sirve en la raíz del dominio: `base: '/'` en `vite.config.ts` y `BrowserRouter` sin `basename`. Si algún día se sirve en un subdirectorio, hay que cambiar los dos y `pathSegmentsToKeep` en `public/404.html`.

Los scripts de `sql/` no se despliegan solos: se corren a mano en APEX.

### Routing en GitHub Pages (404 SPA)

GitHub Pages no conoce las rutas de React Router, por lo que al recargar o entrar directo a una sub-ruta (p. ej. `/cotizador`) devolvería 404. Para resolverlo:

- `public/404.html` guarda la ruta solicitada en un query y redirige al `index.html`.
- Un script en el `<head>` de `index.html` decodifica ese query y restaura la URL real antes de que arranque React Router.

Para las rutas conocidas eso no alcanza para Google: `404.html` responde HTTP 404 y la página no se indexa. Por eso el build genera además `dist/catalogo.html`, `dist/cotizador.html`, etc. (plugin `seoPages` en `vite.config.ts`), copias de `index.html` con el título, la descripción y el canonical de cada página. GitHub Pages sirve `/catalogo` desde `catalogo.html` con 200. Los textos de cada página están en `src/lib/seo.ts`; `<SeoMeta />` los actualiza al navegar dentro de la SPA. Una ruta nueva se agrega ahí y en `public/sitemap.xml`.

## Notas adicionales

- El layout (Navbar + Footer + Asistente) es compartido por todas las rutas y se define en `App.tsx`.
- `ScrollToTop` resetea el scroll al cambiar de ruta.
- El número de WhatsApp, la API base y los descuentos están centralizados en `src/lib/config.ts`.

---

© 2026 Lubrimec — Capiatá, Paraguay
