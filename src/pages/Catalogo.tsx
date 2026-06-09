import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Search, PackageSearch, X, Menu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticulos } from "@/hooks/useArticulos";
import { useViscosidades } from "@/hooks/useViscosidades";
import ArticleCard from "@/components/ArticleCard";
import ProductModal from "@/components/ProductModal";
import { useRubros } from "@/hooks/useRubros";
import { useMarcas } from "@/hooks/useMarcas";
import FilterSidebar from "@/components/FilterSidebar";
import type { Articulo } from "@/hooks/useArticulos";

const Catalogo = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(1);
  const pageSize = 16;

  const parseIds = (key: string): number[] =>
    (searchParams.get(key) || "")
      .split(",")
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0);

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("q") || "");
  const [activeRubroIds, setActiveRubroIds] = useState<number[]>(() => parseIds("rubro"));
  const [activeViscosidadIds, setActiveViscosidadIds] = useState<number[]>(() => parseIds("viscosidad"));
  const [activeMarcaIds, setActiveMarcaIds] = useState<number[]>(() => parseIds("marca"));
  const [stockFilter, setStockFilter] = useState<"todos" | "stock" | "sin">(
    (searchParams.get("stock") as "todos" | "stock" | "sin") || "stock"
  );
  const [selectedArticulo, setSelectedArticulo] = useState<Articulo | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const loadMoreButtonRef = useRef<HTMLButtonElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (activeRubroIds.length) params.set("rubro", activeRubroIds.join(","));
    if (activeViscosidadIds.length) params.set("viscosidad", activeViscosidadIds.join(","));
    if (activeMarcaIds.length) params.set("marca", activeMarcaIds.join(","));
    if (stockFilter !== "stock") params.set("stock", stockFilter);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, activeRubroIds, activeViscosidadIds, activeMarcaIds, stockFilter, setSearchParams]);

  const toggleId = (setter: React.Dispatch<React.SetStateAction<number[]>>) => (id: number) => {
    setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setPage(1);
  };
  const handleToggleRubro = toggleId(setActiveRubroIds);
  const handleToggleViscosidad = toggleId(setActiveViscosidadIds);
  const handleToggleMarca = toggleId(setActiveMarcaIds);
  const handleClearRubros = () => { setActiveRubroIds([]); setPage(1); };
  const handleClearViscosidades = () => { setActiveViscosidadIds([]); setPage(1); };
  const handleClearMarcas = () => { setActiveMarcaIds([]); setPage(1); };
  const handleStockChange = (val: "todos" | "stock" | "sin") => { setStockFilter(val); setPage(1); };
  const handleClearAll = () => {
    setActiveRubroIds([]);
    setActiveViscosidadIds([]);
    setActiveMarcaIds([]);
    setStockFilter("stock");
    setPage(1);
  };

  const { rubros, loading: rubrosLoading, error: rubrosError } = useRubros();

  const { articulos, loading: articulosLoading, error: articulosError } = useArticulos();
  const { viscosidades, loading: viscosidadesLoading, error: viscosidadesError } = useViscosidades();
  const { marcas, loading: marcasLoading, error: marcasError } = useMarcas();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setShowScrollTop(scrollY > 360);
      setIsScrolled(scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prefiltro de stock: base sobre la que se calculan filtros cruzados y resultados
  const matchesStockFilter = (a: Articulo) => {
    if (stockFilter === "todos") return true;
    const tiene = (a.stock ?? 0) > 0;
    return stockFilter === "stock" ? tiene : !tiene;
  };
  const articulosBase = useMemo(
    () => articulos.filter(matchesStockFilter),
    [articulos, stockFilter]
  );

  const rubrosDisponibles = useMemo(() => {
    let subset = articulosBase;
    if (activeViscosidadIds.length) subset = subset.filter(a => a.id_viscosidad != null && activeViscosidadIds.includes(a.id_viscosidad));
    if (activeMarcaIds.length) subset = subset.filter(a => a.id_marca != null && activeMarcaIds.includes(a.id_marca));
    const ids = new Set(subset.map(a => a.id_rubro).filter(Boolean) as number[]);
    return rubros.filter(r => ids.has(r.id_rubro));
  }, [articulosBase, activeViscosidadIds, activeMarcaIds, rubros]);

  const viscosidadesDisponibles = useMemo(() => {
    let subset = activeRubroIds.length
      ? articulosBase.filter(a => a.id_rubro != null && activeRubroIds.includes(a.id_rubro) && a.id_viscosidad != null)
      : articulosBase.filter(a => a.id_viscosidad != null);
    if (activeMarcaIds.length) subset = subset.filter(a => a.id_marca != null && activeMarcaIds.includes(a.id_marca));
    const ids = new Set(subset.map(a => a.id_viscosidad!));
    return viscosidades.filter(v => ids.has(v.id_viscosidad));
  }, [articulosBase, activeRubroIds, activeMarcaIds, viscosidades]);

  const q = debouncedSearch.toLowerCase().trim();

  const availableMarcas = useMemo(() => {
    let subset = activeRubroIds.length
      ? articulosBase.filter(a => a.id_rubro != null && activeRubroIds.includes(a.id_rubro))
      : articulosBase;
    if (activeViscosidadIds.length) subset = subset.filter(a => a.id_viscosidad != null && activeViscosidadIds.includes(a.id_viscosidad));
    const marcaIdsEnUso = new Set(subset.map(a => a.id_marca).filter(Boolean) as number[]);
    return marcas
      .filter(m => marcaIdsEnUso.has(m.id_marca))
      .sort((a, b) => a.descripcion_marca.localeCompare(b.descripcion_marca));
  }, [articulosBase, activeRubroIds, activeViscosidadIds, marcas]);


  useEffect(() => {
    if (activeMarcaIds.length && availableMarcas.length > 0) {
      const valid = availableMarcas.map(m => m.id_marca);
      const filtered = activeMarcaIds.filter(id => valid.includes(id));
      if (filtered.length !== activeMarcaIds.length) setActiveMarcaIds(filtered);
    }
  }, [activeMarcaIds, availableMarcas]);

  useEffect(() => {
    if (activeViscosidadIds.length && viscosidadesDisponibles.length > 0) {
      const valid = viscosidadesDisponibles.map(v => v.id_viscosidad);
      const filtered = activeViscosidadIds.filter(id => valid.includes(id));
      if (filtered.length !== activeViscosidadIds.length) setActiveViscosidadIds(filtered);
    }
  }, [activeViscosidadIds, viscosidadesDisponibles]);

  // En catálogo: precio de lista (API) con 30% de descuento
  const articulosConPrecio = articulos.map((a) => ({
    ...a,
    precioLista: a.precio ?? null,
    precio: a.precio != null ? Math.round(a.precio * 0.7) : a.precio,
  }));

  const displayedArticulos = articulosConPrecio.filter((a) => {
    const descripcion = (a.descripcion_articulo || "").toLowerCase();
    const marca = (a.descripcion_marca || "").toLowerCase();
    const rubro = (a.descripcion_rubro || "").toLowerCase();
    const matchesSearch = q === "" ? true : descripcion.includes(q) || marca.includes(q) || rubro.includes(q);
    const matchesRubro = activeRubroIds.length ? (a.id_rubro != null && activeRubroIds.includes(a.id_rubro)) : true;
    const matchesViscosidad = activeViscosidadIds.length ? (a.id_viscosidad != null && activeViscosidadIds.includes(a.id_viscosidad)) : true;
    const matchesMarca = activeMarcaIds.length ? (a.id_marca != null && activeMarcaIds.includes(a.id_marca)) : true;
    const tieneStock = (a.stock ?? 0) > 0;
    const matchesStock = stockFilter === "todos" ? true : stockFilter === "stock" ? tieneStock : !tieneStock;
    return matchesSearch && matchesRubro && matchesViscosidad && matchesMarca && matchesStock;
  });

  const paginatedArticulos = displayedArticulos.slice(0, page * pageSize);
  const hasMore = paginatedArticulos.length < displayedArticulos.length;

  const selectedIndex = selectedArticulo
    ? displayedArticulos.findIndex(a => a.id_articulo === selectedArticulo.id_articulo)
    : -1;
  const handlePrevArticulo = () => {
    if (selectedIndex > 0) setSelectedArticulo(displayedArticulos[selectedIndex - 1]);
  };
  const handleNextArticulo = () => {
    if (selectedIndex < displayedArticulos.length - 1) setSelectedArticulo(displayedArticulos[selectedIndex + 1]);
  };

  const activeRubroChips = useMemo(
    () => activeRubroIds.map(id => ({ id, name: rubros.find(r => r.id_rubro === id)?.descripcion_rubro ?? `#${id}` })),
    [activeRubroIds, rubros]
  );
  const activeViscosidadChips = useMemo(
    () => activeViscosidadIds.map(id => ({ id, name: viscosidades.find(v => v.id_viscosidad === id)?.descripcion ?? `#${id}` })),
    [activeViscosidadIds, viscosidades]
  );
  const activeMarcaChips = useMemo(
    () => activeMarcaIds.map(id => ({ id, name: marcas.find(m => m.id_marca === id)?.descripcion_marca ?? `#${id}` })),
    [activeMarcaIds, marcas]
  );

  const hasActiveFilters = activeRubroIds.length > 0 || activeViscosidadIds.length > 0 || activeMarcaIds.length > 0 || stockFilter !== "todos" || debouncedSearch !== "";

  return (
    <div className="min-h-screen">
      <a
        href="#product-grid"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
      >
        Saltar al contenido
      </a>

      {/* Page header */}
      <div className="pt-24 pb-8 px-4 bg-gradient-to-b from-card/40 to-transparent border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            CATÁLOGO DE PRODUCTOS
          </h1>
          <p className="text-muted-foreground text-sm">
            Lubricantes, aceites, filtros y más — filtrá por categoría, marca y viscosidad.
          </p>
        </div>
      </div>

      <div className="flex overflow-x-hidden max-w-7xl mx-auto">
        {/* Sidebar */}
        <FilterSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          rubros={rubrosDisponibles}
          viscosidades={viscosidadesDisponibles}
          marcas={availableMarcas}
          activeRubroIds={activeRubroIds}
          activeViscosidadIds={activeViscosidadIds}
          activeMarcaIds={activeMarcaIds}
          onToggleRubro={handleToggleRubro}
          onToggleViscosidad={handleToggleViscosidad}
          onToggleMarca={handleToggleMarca}
          onClearRubros={handleClearRubros}
          onClearViscosidades={handleClearViscosidades}
          onClearMarcas={handleClearMarcas}
          stockFilter={stockFilter}
          onStockChange={handleStockChange}
          onClearAll={handleClearAll}
          resultCount={displayedArticulos.length}
        />

        {/* Main content */}
        <main className="flex-1 w-full">
        {/* Sticky search bar */}
        <div className="sticky top-16 z-40 pb-4 pt-3 px-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-border text-foreground hover:bg-secondary/50 transition-colors"
              aria-label="Abrir filtros"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar productos, marcas, rubros..."
                value={search}
                onChange={handleSearchChange}
                aria-label="Buscar productos, marcas, rubros"
                className={`w-full bg-card/60 backdrop-blur-sm border border-border rounded-2xl py-3 pl-12 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${isScrolled ? "shadow-lg shadow-black/10" : ""}`}
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setDebouncedSearch(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-2 max-w-full">
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                  Búsqueda: "{debouncedSearch}"
                  <button onClick={() => { setSearch(""); setDebouncedSearch(""); }} className="ml-0.5 hover:text-primary/70" aria-label="Quitar búsqueda"><X className="w-3 h-3" /></button>
                </span>
              )}
              {activeRubroChips.map(chip => (
                <span key={`r-${chip.id}`} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                  Categoría: {chip.name}
                  <button onClick={() => handleToggleRubro(chip.id)} className="ml-0.5 hover:text-primary/70" aria-label="Quitar categoría"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {activeViscosidadChips.map(chip => (
                <span key={`v-${chip.id}`} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                  Viscosidad: {chip.name}
                  <button onClick={() => handleToggleViscosidad(chip.id)} className="ml-0.5 hover:text-primary/70" aria-label="Quitar viscosidad"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {activeMarcaChips.map(chip => (
                <span key={`m-${chip.id}`} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                  Marca: {chip.name}
                  <button onClick={() => handleToggleMarca(chip.id)} className="ml-0.5 hover:text-primary/70" aria-label="Quitar marca"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {stockFilter !== "todos" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                  {stockFilter === "stock" ? "Con stock" : "Sin stock"}
                  <button onClick={() => handleStockChange("todos")} className="ml-0.5 hover:text-primary/70" aria-label="Quitar filtro de stock"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={() => { setSearch(""); setDebouncedSearch(""); handleClearAll(); }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <X className="w-3 h-3" />
                Limpiar todo
              </button>
            </div>
          )}

          {(articulosLoading || marcasLoading || rubrosLoading || viscosidadesLoading) && (
            <div className="mb-2 overflow-hidden rounded-full h-1 bg-secondary">
              <div className="h-full w-1/3 bg-primary rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]" />
            </div>
          )}
          {viscosidadesError && <div className="mb-2 text-sm text-destructive">{viscosidadesError}</div>}
        </div>

        {/* Results count */}
        {!articulosLoading && (
          <p className="text-sm text-muted-foreground mb-4 px-4">
            {displayedArticulos.length > 0
              ? `Mostrando ${Math.min(paginatedArticulos.length, displayedArticulos.length)} de ${displayedArticulos.length} productos`
              : "0 productos encontrados"}
          </p>
        )}

        {/* Product Grid */}
        <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 py-8">
          <AnimatePresence mode="popLayout">
            {articulosLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-4">
                  <Skeleton className="w-full aspect-square rounded-md mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <div className="flex justify-between items-end">
                    <div><Skeleton className="h-5 w-24 mb-1" /><Skeleton className="h-3 w-16" /></div>
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              ))
            ) : paginatedArticulos.length > 0 ? (
              paginatedArticulos.map((art) => (
                <motion.div
                  key={art.id_articulo}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver detalles de ${art.descripcion_articulo}`}
                  onClick={() => setSelectedArticulo(art)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedArticulo(art); } }}
                >
                  <ArticleCard articulo={art} searchQuery={debouncedSearch} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <PackageSearch className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No se encontraron productos</h3>
                <p className="text-sm text-muted-foreground mb-3">Los filtros activos no devolvieron resultados</p>
                <button
                  onClick={() => { setSearch(""); setDebouncedSearch(""); handleClearAll(); }}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Load more */}
        {hasMore && !articulosLoading && (
          <div className="flex justify-center mt-8 px-4 pb-8">
            <button
              ref={loadMoreButtonRef}
              onClick={() => {
                setPage((p) => p + 1);
                setTimeout(() => { loadMoreButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 100);
              }}
              className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-all"
            >
              Cargar más productos ({displayedArticulos.length - paginatedArticulos.length} restantes)
            </button>
          </div>
        )}
      </main>
      </div>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            type="button"
            aria-label="Volver arriba"
            className="fixed right-5 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-2xl shadow-primary/30 ring-1 ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <ProductModal
        articulo={selectedArticulo}
        isOpen={selectedArticulo !== null}
        onClose={() => setSelectedArticulo(null)}
        onPrev={handlePrevArticulo}
        onNext={handleNextArticulo}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < displayedArticulos.length - 1}
      />
    </div>
  );
};

export default Catalogo;
