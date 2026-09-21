import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  PackageSearch,
  FileText,
  ClipboardList,
  Percent,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import ProductPlaceholder from "@/components/ProductPlaceholder";
import PedidoMayoristaModal from "@/components/PedidoMayoristaModal";
import { useArticulos, type Articulo } from "@/hooks/useArticulos";
import { useRubros } from "@/hooks/useRubros";
import { useMarcas } from "@/hooks/useMarcas";
import { useListaMayorista, type ItemMayorista } from "@/hooks/useListaMayorista";
import { API_BASE, DESCUENTO_MAYORISTA } from "@/lib/config";

const fmt = (n: number) => new Intl.NumberFormat("es-PY").format(n);

const PAGE_SIZE = 30;

/* ---------------------------------------------------------------- */
/* Miniatura                                                         */
/* ---------------------------------------------------------------- */

function Miniatura({
  id_articulo,
  tiene_imagen,
  rubro,
  alt,
}: {
  id_articulo: number;
  tiene_imagen?: number;
  rubro?: string | null;
  alt?: string;
}) {
  const [hasError, setHasError] = useState(false);
  if (tiene_imagen !== 1 || hasError) {
    return <ProductPlaceholder rubro={rubro} iconClassName="w-6 h-6" />;
  }
  return (
    <img
      src={`${API_BASE}/josegalvez/paginaweb/articulosimg/${id_articulo}`}
      alt={alt || ""}
      className="max-w-full max-h-full object-contain"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

/* ---------------------------------------------------------------- */
/* Selector de cantidad                                              */
/* ---------------------------------------------------------------- */

function Stepper({
  cantidad,
  onChange,
  size = "md",
}: {
  cantidad: number;
  onChange: (n: number) => void;
  size?: "sm" | "md";
}) {
  // Campo editable: un mayorista que pide 24 unidades no debería tocar "+" 24 veces.
  const [texto, setTexto] = useState(String(cantidad));
  useEffect(() => setTexto(String(cantidad)), [cantidad]);

  const btn =
    size === "sm"
      ? "w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition disabled:opacity-40"
      : "w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition disabled:opacity-40";
  const icon = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div
      className="flex items-center border border-border rounded-lg bg-background overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => onChange(cantidad - 1)}
        className={`${btn} rounded-l-lg`}
        aria-label="Quitar uno"
      >
        <Minus className={icon} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={() => {
          const n = parseInt(texto, 10);
          if (!Number.isFinite(n) || n < 0) setTexto(String(cantidad));
          else onChange(n);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        aria-label="Cantidad"
        className={`${size === "sm" ? "w-10 h-7 text-xs" : "w-12 h-9 text-sm"} text-center font-semibold tabular-nums bg-transparent text-foreground outline-none focus:bg-primary/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
      <button
        type="button"
        onClick={() => onChange(cantidad + 1)}
        className={`${btn} rounded-r-lg`}
        aria-label="Agregar uno"
      >
        <Plus className={icon} />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Fila de artículo                                                  */
/* ---------------------------------------------------------------- */

function FilaArticulo({
  articulo,
  cantidad,
  onAgregar,
  onCantidad,
}: {
  articulo: Articulo;
  cantidad: number;
  onAgregar: () => void;
  onCantidad: (n: number) => void;
}) {
  const stock = articulo.stock ?? 0;
  const elegido = cantidad > 0;
  const superaStock = articulo.stock != null && cantidad > stock;
  const subtotal = (articulo.precio ?? 0) * cantidad;

  return (
    <div
      onClick={elegido ? undefined : onAgregar}
      role={elegido ? undefined : "button"}
      tabIndex={elegido ? undefined : 0}
      onKeyDown={(e) => {
        if (!elegido && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onAgregar();
        }
      }}
      className={`group flex items-center gap-3 sm:gap-4 rounded-xl border p-2.5 sm:p-3 transition-all ${
        elegido
          ? "border-primary/50 bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/30 hover:bg-secondary/30 cursor-pointer active:scale-[0.995]"
      }`}
    >
      {/* Foto */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-white rounded-lg flex items-center justify-center overflow-hidden">
        <Miniatura
          id_articulo={articulo.id_articulo}
          tiene_imagen={articulo.tiene_imagen}
          rubro={articulo.descripcion_rubro}
          alt={articulo.descripcion_articulo}
        />
      </div>

      {/* Descripción */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
          {articulo.descripcion_articulo}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
          {articulo.descripcion_marca && (
            <span className="text-xs text-muted-foreground truncate">{articulo.descripcion_marca}</span>
          )}
          {stock > 0 ? (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{stock} en stock</span>
          ) : (
            <span className="text-[11px] font-medium text-muted-foreground">Sin stock — a pedido</span>
          )}
        </div>
        {superaStock && (
          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-0.5">
            Pedís más que el stock actual ({stock}) — lo confirmamos por WhatsApp
          </p>
        )}
      </div>

      {/* Precio */}
      <div className="hidden sm:block text-right shrink-0 w-32">
        {articulo.precio != null ? (
          <>
            {articulo.precioLista != null && articulo.precioLista > articulo.precio && (
              <p className="text-[11px] text-muted-foreground line-through tabular-nums">
                Gs. {fmt(articulo.precioLista)}
              </p>
            )}
            <p className="text-sm font-bold text-primary tabular-nums">Gs. {fmt(articulo.precio)}</p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground italic">A consultar</p>
        )}
      </div>

      {/* Acción */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        {elegido ? (
          <>
            <Stepper cantidad={cantidad} onChange={onCantidad} />
            {articulo.precio != null && (
              <span className="text-[11px] font-semibold text-foreground tabular-nums">Gs. {fmt(subtotal)}</span>
            )}
          </>
        ) : (
          <>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/60 text-muted-foreground text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              aria-hidden="true"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Agregar</span>
            </span>
            {articulo.precio != null && (
              <span className="sm:hidden text-[11px] font-bold text-primary tabular-nums">
                Gs. {fmt(articulo.precio)}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Panel "Mi pedido"                                                 */
/* ---------------------------------------------------------------- */

function PanelPedido({ onVerPedido }: { onVerPedido: () => void }) {
  const {
    items,
    cliente,
    setCliente,
    setCantidad,
    removeItem,
    clear,
    restore,
    totalLineas,
    totalUnidades,
    totalPrecio,
    totalLista,
  } = useListaMayorista();

  // Vaciar sin confirmación previa, pero con "Deshacer" por si fue un toque accidental.
  const handleVaciar = () => {
    const snapshot: ItemMayorista[] = items;
    clear();
    toast("Pedido vaciado", {
      action: { label: "Deshacer", onClick: () => restore(snapshot) },
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-4 py-10">
        <ClipboardList className="w-12 h-12 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-semibold text-foreground">Tu pedido está vacío</p>
        <p className="text-xs text-muted-foreground mt-1">
          Tocá un producto de la lista para agregarlo. Después ajustás las cantidades acá.
        </p>
      </div>
    );
  }

  return (
    // `flex-1 min-h-0` es lo que deja que la lista de adentro haga scroll en vez
    // de estirar el panel: sin esto el resumen y los botones quedan fuera de vista.
    <div className="flex-1 flex flex-col min-h-0">
      {/* Items */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id_articulo}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="flex gap-2.5 rounded-lg border border-border bg-background/60 p-2"
            >
              <div className="w-10 h-10 shrink-0 bg-white rounded flex items-center justify-center overflow-hidden">
                <Miniatura
                  id_articulo={item.id_articulo}
                  tiene_imagen={item.tiene_imagen}
                  rubro={item.descripcion_rubro}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                  {item.descripcion_articulo}
                </p>
                <div className="flex items-center justify-between gap-2 mt-1.5">
                  <Stepper
                    cantidad={item.cantidad}
                    size="sm"
                    onChange={(n) => setCantidad(item.id_articulo, n)}
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground tabular-nums">
                      {item.precio != null ? `Gs. ${fmt(item.precio * item.cantidad)}` : "—"}
                    </span>
                    <button
                      onClick={() => removeItem(item.id_articulo)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                      aria-label={`Quitar ${item.descripcion_articulo} del pedido`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Totales y acciones */}
      <div className="shrink-0 border-t border-border p-3 space-y-3 bg-card">
        <input
          type="text"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Nombre o comercio (opcional)"
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition"
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Precio de lista</span>
            <span className="tabular-nums line-through">Gs. {fmt(totalLista)}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Ahorro {DESCUENTO_MAYORISTA}%</span>
            <span className="tabular-nums">− Gs. {fmt(totalLista - totalPrecio)}</span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-border">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary tabular-nums">Gs. {fmt(totalPrecio)}</span>
          </div>
          <p className="text-[11px] text-muted-foreground text-right tabular-nums">
            {totalLineas} producto{totalLineas !== 1 ? "s" : ""} · {totalUnidades} unidad
            {totalUnidades !== 1 ? "es" : ""}
          </p>
        </div>

        <button
          onClick={onVerPedido}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
        >
          <FileText className="w-5 h-5" />
          Ver mi pedido
        </button>
        <button
          onClick={handleVaciar}
          className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Vaciar pedido
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Página                                                            */
/* ---------------------------------------------------------------- */

export default function Mayorista() {
  const { articulos, loading, error } = useArticulos();
  const { rubros } = useRubros();
  const { marcas } = useMarcas();
  const { items, addItem, setCantidad, getCantidad, totalLineas, totalPrecio } = useListaMayorista();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rubroId, setRubroId] = useState<number | null>(null);
  const [marcaId, setMarcaId] = useState<number | null>(null);
  const [soloStock, setSoloStock] = useState(true);
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // El pedido mayorista usa su propio porcentaje, aunque hoy coincida con el
  // del catálogo: así se puede mover uno sin tocar el otro.
  const articulosConPrecio = useMemo(
    () =>
      articulos.map((a) => ({
        ...a,
        precioLista: a.precio ?? null,
        precio: a.precio != null ? Math.round(a.precio * (1 - DESCUENTO_MAYORISTA / 100)) : a.precio,
      })),
    [articulos]
  );

  const q = debouncedSearch.trim().toLowerCase();

  const filtrados = useMemo(
    () =>
      articulosConPrecio.filter((a) => {
        const coincide =
          q === "" ||
          (a.descripcion_articulo || "").toLowerCase().includes(q) ||
          (a.descripcion_marca || "").toLowerCase().includes(q) ||
          (a.descripcion_rubro || "").toLowerCase().includes(q);
        const okRubro = rubroId == null || a.id_rubro === rubroId;
        const okMarca = marcaId == null || a.id_marca === marcaId;
        const okStock = !soloStock || (a.stock ?? 0) > 0;
        return coincide && okRubro && okMarca && okStock;
      }),
    [articulosConPrecio, q, rubroId, marcaId, soloStock]
  );

  // Rubros y marcas que realmente existen entre los artículos visibles, para no
  // ofrecer filtros que devuelven cero resultados.
  const rubrosDisponibles = useMemo(() => {
    const ids = new Set(articulosConPrecio.map((a) => a.id_rubro).filter((x): x is number => x != null));
    return rubros.filter((r) => ids.has(r.id_rubro));
  }, [rubros, articulosConPrecio]);

  const marcasDisponibles = useMemo(() => {
    const base = rubroId == null ? articulosConPrecio : articulosConPrecio.filter((a) => a.id_rubro === rubroId);
    const ids = new Set(base.map((a) => a.id_marca).filter((x): x is number => x != null));
    return marcas.filter((m) => ids.has(m.id_marca));
  }, [marcas, articulosConPrecio, rubroId]);

  // Si el rubro elegido deja sin sentido la marca elegida, la soltamos.
  useEffect(() => {
    if (marcaId != null && !marcasDisponibles.some((m) => m.id_marca === marcaId)) setMarcaId(null);
  }, [marcaId, marcasDisponibles]);

  const visibles = filtrados.slice(0, page * PAGE_SIZE);
  const hayMas = visibles.length < filtrados.length;

  const hayFiltros = q !== "" || rubroId != null || marcaId != null || !soloStock;
  const limpiarFiltros = () => {
    setSearch("");
    setRubroId(null);
    setMarcaId(null);
    setSoloStock(true);
    setPage(1);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      {/* Encabezado */}
      <div className="pt-24 pb-6 px-4 bg-gradient-to-b from-card/40 to-transparent border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-2"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            PEDIDO MAYORISTA
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Armá tu lista de reposición: elegí los productos, poné las cantidades y descargá o copiá el pedido
            para enviárnoslo.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <Percent className="w-4 h-4" />
              {DESCUENTO_MAYORISTA}% de descuento en todos los productos
            </span>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm text-muted-foreground hover:text-foreground border border-border hover:bg-secondary/50 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Ver el catálogo completo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start">
        {/* --- Columna principal --- */}
        <div className="min-w-0">
          {/* Barra de filtros */}
          <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-b border-border space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto, marca o rubro…"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <select
                value={marcaId ?? ""}
                onChange={(e) => {
                  setMarcaId(e.target.value ? Number(e.target.value) : null);
                  setPage(1);
                }}
                aria-label="Filtrar por marca"
                className="shrink-0 max-w-[10rem] px-3 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground outline-none focus:border-primary/60 transition"
              >
                <option value="">Todas las marcas</option>
                {marcasDisponibles.map((m) => (
                  <option key={m.id_marca} value={m.id_marca}>
                    {m.descripcion_marca}
                  </option>
                ))}
              </select>
            </div>

            {/* Chips de rubro */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
              <button
                onClick={() => {
                  setRubroId(null);
                  setPage(1);
                }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  rubroId == null
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                Todos
              </button>
              {rubrosDisponibles.map((r) => (
                <button
                  key={r.id_rubro}
                  onClick={() => {
                    setRubroId(rubroId === r.id_rubro ? null : r.id_rubro);
                    setPage(1);
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition whitespace-nowrap ${
                    rubroId === r.id_rubro
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {r.descripcion_rubro}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={soloStock}
                  onChange={(e) => {
                    setSoloStock(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                Sólo con stock disponible
              </label>
              <div className="flex items-center gap-3">
                {hayFiltros && (
                  <button
                    onClick={limpiarFiltros}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition"
                  >
                    Limpiar filtros
                  </button>
                )}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {loading ? "Cargando…" : `${filtrados.length} producto${filtrados.length !== 1 ? "s" : ""}`}
                </span>
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="mt-4 space-y-2">
            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <Skeleton className="w-14 h-14 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-9 w-24 rounded-lg shrink-0" />
                </div>
              ))}

            {!loading && filtrados.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <PackageSearch className="w-14 h-14 text-muted-foreground/40 mb-3" />
                <h3 className="text-base font-semibold text-foreground">No encontramos productos</h3>
                <p className="text-sm text-muted-foreground mt-1">Probá con otra búsqueda o quitá los filtros.</p>
                {hayFiltros && (
                  <button
                    onClick={limpiarFiltros}
                    className="mt-4 px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}

            {visibles.map((a) => (
              <FilaArticulo
                key={a.id_articulo}
                articulo={a}
                cantidad={getCantidad(a.id_articulo)}
                onAgregar={() => addItem(a, 1)}
                onCantidad={(n) => setCantidad(a.id_articulo, n)}
              />
            ))}

            {hayMas && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="w-full mt-4 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
              >
                Cargar más ({filtrados.length - visibles.length} restantes)
              </button>
            )}
          </div>
        </div>

        {/* --- Panel lateral (desktop) --- */}
        <aside
          aria-label="Mi pedido"
          className="hidden lg:flex lg:flex-col sticky top-20 max-h-[calc(100vh-6rem)] rounded-2xl border border-border bg-card overflow-hidden"
        >
          <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border">
            <ClipboardList className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Mi pedido</h2>
            {totalLineas > 0 && (
              <span className="ml-auto text-xs font-semibold text-primary tabular-nums">
                {totalLineas} ítem{totalLineas !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <PanelPedido onVerPedido={() => setModalOpen(true)} />
        </aside>
      </div>

      {/* --- Barra inferior (móvil) --- */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.button
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            onClick={() => setSheetOpen(true)}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-4 py-3 bg-primary text-primary-foreground shadow-[0_-4px_20px_rgba(0,0,0,0.25)]"
          >
            <div className="text-left min-w-0">
              <p className="text-xs opacity-90">
                {totalLineas} producto{totalLineas !== 1 ? "s" : ""} en tu pedido
              </p>
              <p className="text-base font-bold tabular-nums">Gs. {fmt(totalPrecio)}</p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-foreground/15 text-sm font-semibold">
              Ver pedido
              <ChevronUp className="w-4 h-4" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* --- Hoja inferior (móvil) --- */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label="Mi pedido"
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] flex flex-col rounded-t-2xl border-t border-border bg-card overflow-hidden"
            >
              <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border">
                <ClipboardList className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Mi pedido</h2>
                <button
                  onClick={() => setSheetOpen(false)}
                  aria-label="Cerrar"
                  className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <PanelPedido
                onVerPedido={() => {
                  setSheetOpen(false);
                  setModalOpen(true);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PedidoMayoristaModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
