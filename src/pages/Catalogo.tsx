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

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("q") || "");
  const [activeRubroId, setActiveRubroId] = useState<number | null>(
    searchParams.get("rubro") ? Number(searchParams.get("rubro")) : null
  );
  const [activeViscosidadId, setActiveViscosidadId] = useState<number | null>(
    searchParams.get("viscosidad") ? Number(searchParams.get("viscosidad")) : null
  );
  const [activeMarcaId, setActiveMarcaId] = useState<number | null>(
    searchParams.get("marca") ? Number(searchParams.get("marca")) : null
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
    if (activeRubroId) params.set("rubro", String(activeRubroId));
    if (activeViscosidadId) params.set("viscosidad", String(activeViscosidadId));
    if (activeMarcaId) params.set("marca", String(activeMarcaId));
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, activeRubroId, activeViscosidadId, activeMarcaId, setSearchParams]);

  const handleRubroClick = (rubroId: number | null) => {
    setActiveRubroId(rubroId);
    setActiveViscosidadId(null);
    setActiveMarcaId(null);
    setPage(1);
  };
  const handleViscosidadClick = (id_viscosidad: number | null) => {
    setActiveViscosidadId(id_viscosidad);
    setPage(1);
  };
  const handleMarcaClick = (id_marca: number | null) => {
    setActiveMarcaId(id_marca);
    setPage(1);
  };
  const handleClearAll = () => {
    setActiveRubroId(null);
    setActiveViscosidadId(null);
    setActiveMarcaId(null);
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

  const viscosidadesDisponibles = useMemo(() => {
    let subset = activeRubroId
      ? articulos.filter(a => a.id_rubro === activeRubroId && a.id_viscosidad != null)
      : articulos.filter(a => a.id_viscosidad != null);
    if (activeMarcaId) subset = subset.filter(a => a.id_marca === activeMarcaId);
    const ids = new Set(subset.map(a => a.id_viscosidad!));
    return viscosidades.filter(v => ids.has(v.id_viscosidad));
  }, [articulos, activeRubroId, activeMarcaId, viscosidades]);

  const q = debouncedSearch.toLowerCase().trim();

  const availableMarcas = useMemo(() => {
    let subset = activeRubroId
      ? articulos.filter(a => a.id_rubro === activeRubroId)
      : articulos;
    if (activeViscosidadId) subset = subset.filter(a => a.id_viscosidad === activeViscosidadId);
    const marcaIdsEnUso = new Set(subset.map(a => a.id_marca).filter(Boolean) as number[]);
    return marcas
      .filter(m => marcaIdsEnUso.has(m.id_marca))
      .sort((a, b) => a.descripcion_marca.localeCompare(b.descripcion_marca));
  }, [articulos, activeRubroId, activeViscosidadId, marcas]);


  useEffect(() => {
    if (activeMarcaId && availableMarcas.length > 0 && !availableMarcas.some(m => m.id_marca === activeMarcaId)) {
      setActiveMarcaId(null);
    }
  }, [activeMarcaId, availableMarcas]);

  useEffect(() => {
    if (activeViscosidadId && viscosidadesDisponibles.length > 0 && !viscosidadesDisponibles.some(v => v.id_viscosidad === activeViscosidadId)) {
      setActiveViscosidadId(null);
    }
  }, [activeViscosidadId, viscosidadesDisponibles]);

  const displayedArticulos = articulos.filter((a) => {
    const descripcion = (a.descripcion_articulo || "").toLowerCase();
    const marca = (a.descripcion_marca || "").toLowerCase();
    const rubro = (a.descripcion_rubro || "").toLowerCase();
    const matchesSearch = q === "" ? true : descripcion.includes(q) || marca.includes(q) || rubro.includes(q);
    const matchesRubro = activeRubroId ? a.id_rubro === activeRubroId : true;
    const matchesViscosidad = activeViscosidadId ? a.id_viscosidad === activeViscosidadId : true;
    const matchesMarca = activeMarcaId ? a.id_marca === activeMarcaId : true;
    return matchesSearch && matchesRubro && matchesViscosidad && matchesMarca;
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

  const activeCategory = useMemo(() => {
    if (!activeRubroId) return "Todos";
    const r = rubros.find(r => r.id_rubro === activeRubroId);
    return r?.descripcion_rubro ?? "Todos";
  }, [activeRubroId, rubros]);


  const activeViscosidadName = useMemo(() => {
    if (!activeViscosidadId) return null;
    return viscosidades.find(v => v.id_viscosidad === activeViscosidadId)?.descripcion ?? null;
  }, [activeViscosidadId, viscosidades]);

  const activeMarcaName = useMemo(() => {
    if (!activeMarcaId) return null;
    return marcas.find(m => m.id_marca === activeMarcaId)?.descripcion_marca ?? null;
  }, [activeMarcaId, marcas]);

  const hasActiveFilters = activeRubroId != null || activeViscosidadId != null || activeMarcaId != null || debouncedSearch !== "";

  return (
    <div className="min-h-screen bg-background">
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

      <div className="flex overflow-x-hidden">
        {/* Sidebar */}
        <FilterSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          rubros={rubros}
          viscosidades={viscosidadesDisponibles}
          marcas={availableMarcas}
          activeRubroId={activeRubroId}
          activeViscosidadId={activeViscosidadId}
          activeMarcaId={activeMarcaId}
          onRubroChange={handleRubroClick}
          onViscosidadChange={handleViscosidadClick}
          onMarcaChange={handleMarcaClick}
          onClearAll={handleClearAll}
        />

        {/* Main content */}
        <main className="flex-1 w-full">
        {/* Sticky search bar */}
        <div className={`sticky top-16 z-40 bg-background pb-4 pt-3 px-4 transition-shadow ${isScrolled ? "shadow-lg shadow-slate-900/40" : ""}`}>
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
                className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
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
              {activeRubroId && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                  Categoría: {activeCategory}
                  <button onClick={() => { setActiveRubroId(null); setActiveViscosidadId(null); setActiveMarcaId(null); setPage(1); }} className="ml-0.5 hover:text-primary/70" aria-label="Quitar categoría"><X className="w-3 h-3" /></button>
                </span>
              )}
              {activeViscosidadName && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                  Viscosidad: {activeViscosidadName}
                  <button onClick={() => { setActiveViscosidadId(null); setPage(1); }} className="ml-0.5 hover:text-primary/70" aria-label="Quitar viscosidad"><X className="w-3 h-3" /></button>
                </span>
              )}
              {activeMarcaName && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                  Marca: {activeMarcaName}
                  <button onClick={() => { setActiveMarcaId(null); setPage(1); }} className="ml-0.5 hover:text-primary/70" aria-label="Quitar marca"><X className="w-3 h-3" /></button>
                </span>
              )}
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
                <div key={i} className="bg-card border border-border rounded-xl p-4">
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
                  onClick={() => { setSearch(""); setDebouncedSearch(""); setActiveRubroId(null); setActiveViscosidadId(null); setActiveMarcaId(null); setPage(1); }}
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
