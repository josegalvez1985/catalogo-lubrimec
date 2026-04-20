import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Search, Phone, MapPin, ChevronDown, ChevronUp, PackageSearch, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticulos } from "@/hooks/useArticulos";
import { useViscosidades } from "@/hooks/useViscosidades";
import ArticleCard from "@/components/ArticleCard";
import ProductModal from "@/components/ProductModal";
import { useRubros } from "@/hooks/useRubros";
import { useMarcas } from "@/hooks/useMarcas";
import type { Articulo } from "@/hooks/useArticulos";
import heroBanner from "@/assets/hero-banner.jpg";
import lubrimecLogo from "@/assets/lubrimec-logo.png";
import PwaInstallButton from "@/components/PwaInstallButton";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado para paginación ("Cargar más")
  const [page, setPage] = useState(1);
  const pageSize = 16;

  // Inicializar desde URL params
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
  const [showMoreMarcas, setShowMoreMarcas] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Reiniciar página cuando cambian los filtros
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Debounce: retrasa el filtrado 300ms tras dejar de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Sincronizar filtros con URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (activeRubroId) params.set("rubro", String(activeRubroId));
    if (activeViscosidadId) params.set("viscosidad", String(activeViscosidadId));
    if (activeMarcaId) params.set("marca", String(activeMarcaId));
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, activeRubroId, activeViscosidadId, activeMarcaId, setSearchParams]);

  const handleCategoryClick = () => {
    setActiveRubroId(null);
    setActiveViscosidadId(null);
    setActiveMarcaId(null);
    setShowMoreMarcas(false);
    setPage(1);
  };
  const handleRubroClick = (rubroId: number) => {
    setActiveRubroId(rubroId);
    setActiveViscosidadId(null);
    setActiveMarcaId(null);
    setShowMoreMarcas(false);
    setPage(1);
  };
  const handleViscosidadClick = (id_viscosidad: number) => {
    setActiveViscosidadId(id_viscosidad);
    setPage(1);
  };
  const [showMoreRubros, setShowMoreRubros] = useState(false);
  const { rubros, loading: rubrosLoading, error: rubrosError } = useRubros();

  const TOP_RUBROS_IDS = [1, 7, 8, 13];
  const topRubros = rubros.filter((r) => TOP_RUBROS_IDS.includes(r.id_rubro));
  const otherRubros = rubros.filter((r) => !TOP_RUBROS_IDS.includes(r.id_rubro));

  const { articulos, loading: articulosLoading, error: articulosError } = useArticulos();
  const { viscosidades, loading: viscosidadesLoading, error: viscosidadesError } = useViscosidades();
  const { marcas, loading: marcasLoading, error: marcasError } = useMarcas();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setShowScrollTop(scrollY > 360);
      setIsScrolled(scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Artículos del rubro activo que tienen viscosidad (filtrados también por marca si aplica)
  const viscosidadesDisponibles = useMemo(() => {
    if (!activeRubroId) return [];
    let subset = articulos.filter(a => a.id_rubro === activeRubroId && a.id_viscosidad != null);
    if (activeMarcaId) subset = subset.filter(a => a.id_marca === activeMarcaId);
    const ids = new Set(subset.map(a => a.id_viscosidad!));
    return viscosidades.filter(v => ids.has(v.id_viscosidad));
  }, [articulos, activeRubroId, activeMarcaId, viscosidades]);

  const q = debouncedSearch.toLowerCase().trim();

  // Marcas disponibles: filtradas por rubro y viscosidad activos
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

  const visibleViscosidades = activeViscosidadId
    ? viscosidadesDisponibles.filter(v => v.id_viscosidad === activeViscosidadId)
    : viscosidadesDisponibles;

  const visibleMarcas = activeMarcaId
    ? availableMarcas.filter(m => m.id_marca === activeMarcaId)
    : availableMarcas;

  const visibleRubros = activeRubroId
    ? rubros.filter(r => r.id_rubro === activeRubroId)
    : topRubros;

  const visibleOtherRubros = activeRubroId ? [] : otherRubros;

  // Limpiar marca si ya no está disponible tras cambiar viscosidad/rubro
  useEffect(() => {
    if (activeMarcaId && availableMarcas.length > 0 && !availableMarcas.some(m => m.id_marca === activeMarcaId)) {
      setActiveMarcaId(null);
    }
  }, [activeMarcaId, availableMarcas]);

  // Limpiar viscosidad si ya no está disponible tras cambiar marca/rubro
  useEffect(() => {
    if (activeViscosidadId && viscosidadesDisponibles.length > 0 && !viscosidadesDisponibles.some(v => v.id_viscosidad === activeViscosidadId)) {
      setActiveViscosidadId(null);
    }
  }, [activeViscosidadId, viscosidadesDisponibles]);

  // Mostrar todos los artículos, filtrando por texto, rubro, viscosidad y marca
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

  // "Cargar más": mostrar artículos acumulados hasta la página actual
  const paginatedArticulos = displayedArticulos.slice(0, page * pageSize);
  const hasMore = paginatedArticulos.length < displayedArticulos.length;

  // Navegación de modal
  const selectedIndex = selectedArticulo
    ? displayedArticulos.findIndex(a => a.id_articulo === selectedArticulo.id_articulo)
    : -1;
  const handlePrevArticulo = () => {
    if (selectedIndex > 0) setSelectedArticulo(displayedArticulos[selectedIndex - 1]);
  };
  const handleNextArticulo = () => {
    if (selectedIndex < displayedArticulos.length - 1) setSelectedArticulo(displayedArticulos[selectedIndex + 1]);
  };

  // Nombre del rubro activo para botones
  const activeCategory = useMemo(() => {
    if (!activeRubroId) return "Todos";
    const r = rubros.find(r => r.id_rubro === activeRubroId);
    return r?.descripcion_rubro ?? "Todos";
  }, [activeRubroId, rubros]);

  const rubroButtonClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all border ${
      active
        ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20"
        : "bg-slate-950 text-emerald-300 border-slate-800 hover:text-emerald-100"
    }`;

  const viscosidadButtonClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all border ${
      active
        ? "bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-400/20"
        : "bg-slate-950 text-amber-300 border-slate-800 hover:text-amber-100"
    }`;

  const marcaButtonClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all border ${
      active
        ? "bg-sky-500 text-slate-950 border-sky-500 shadow-lg shadow-sky-500/20"
        : "bg-slate-950 text-sky-300 border-slate-800 hover:text-sky-100"
    }`;

  // Nombre de la viscosidad activa para chips
  const activeViscosidadName = useMemo(() => {
    if (!activeViscosidadId) return null;
    return viscosidades.find(v => v.id_viscosidad === activeViscosidadId)?.descripcion ?? null;
  }, [activeViscosidadId, viscosidades]);

  // Nombre de la marca activa para chips
  const activeMarcaName = useMemo(() => {
    if (!activeMarcaId) return null;
    return marcas.find(m => m.id_marca === activeMarcaId)?.descripcion_marca ?? null;
  }, [activeMarcaId, marcas]);

  const hasActiveFilters = activeRubroId != null || activeViscosidadId != null || activeMarcaId != null || debouncedSearch !== "";

  

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to content */}
      <a
        href="#product-grid"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
      >
        Saltar al contenido
      </a>

      {/* Hero */}
      <header className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        <img
          src={heroBanner}
          alt="Lubrimec taller"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute h-32 w-32 rounded-[32px] bg-white/95 border border-white/70 shadow-lg shadow-slate-900/10" />
              <img src={lubrimecLogo} alt="Lubrimec" className="relative z-10 w-28 h-28 object-contain drop-shadow-2xl" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-wider">LUBRIMEC</h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground font-sans font-light tracking-wide">
            Tu lubricentro de confianza — Catálogo de productos
          </p>
          <div className="mt-8 flex justify-center">
            <PwaInstallButton />
          </div>
        </motion.div>
      </header>

      {/* Filters — sticky */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className={`sm:sticky sm:top-0 z-40 bg-background pb-4 -mx-4 px-4 pt-2 transition-shadow ${isScrolled ? "shadow-md shadow-background/80" : ""}`}>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={handleSearchChange}
                aria-label="Buscar productos"
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
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleCategoryClick()}
                aria-pressed={activeCategory === "Todos"}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === "Todos" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Todos
              </button>
            {rubrosLoading && <span className="text-muted-foreground">Cargando rubros...</span>}
            {rubrosError && <span className="text-destructive">Error al cargar rubros</span>}

            {!rubrosLoading && !rubrosError && (
              <>
                {visibleRubros.map((rubro) => (
                  <button
                    key={rubro.id_rubro}
                    onClick={() => handleRubroClick(rubro.id_rubro)}
                    aria-pressed={activeRubroId === rubro.id_rubro}
                    className={rubroButtonClass(activeCategory === rubro.descripcion_rubro)}
                  >
                    {rubro.descripcion_rubro}
                  </button>
                ))}

                {!activeRubroId && !showMoreRubros && otherRubros.length > 0 && (
                  <button
                    onClick={() => setShowMoreRubros(true)}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1"
                  >
                    Ver más ({otherRubros.length})
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}

                {!activeRubroId && showMoreRubros &&
                  otherRubros.map((rubro) => (
                    <button
                      key={rubro.id_rubro}
                      onClick={() => handleRubroClick(rubro.id_rubro)}
                      aria-pressed={activeRubroId === rubro.id_rubro}
                      className={rubroButtonClass(activeCategory === rubro.descripcion_rubro)}
                    >
                      {rubro.descripcion_rubro}
                    </button>
                  ))}

                {!activeRubroId && showMoreRubros && (
                  <button
                    onClick={() => setShowMoreRubros(false)}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1"
                  >
                    Menos
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {visibleViscosidades.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-2 text-sm font-semibold text-muted-foreground">Viscosidad:</span>
            <button
              onClick={() => { setActiveViscosidadId(null); setPage(1); }}
              aria-pressed={!activeViscosidadId}
              className={viscosidadButtonClass(!activeViscosidadId)}
            >
              Todas
            </button>
            {visibleViscosidades.slice(0, 4).map((v) => (
              <button
                key={v.id_viscosidad}
                onClick={() => handleViscosidadClick(v.id_viscosidad)}
                aria-pressed={activeViscosidadId === v.id_viscosidad}
                className={viscosidadButtonClass(activeViscosidadId === v.id_viscosidad)}
              >
                {v.descripcion}
              </button>
            ))}
          </div>
        )}

        {/* Filtro por marca */}
        {marcasLoading && <span className="text-sm text-muted-foreground">Cargando marcas...</span>}
        {marcasError && <span className="text-sm text-destructive">{marcasError}</span>}
        {visibleMarcas.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-2 text-sm font-semibold text-muted-foreground">Marca:</span>
            <button
              onClick={() => { setActiveMarcaId(null); setPage(1); }}
              aria-pressed={!activeMarcaId}
              className={marcaButtonClass(!activeMarcaId)}
            >
              Todas
            </button>
            {(showMoreMarcas && !activeMarcaId ? availableMarcas : visibleMarcas.slice(0, 4)).map((marca) => (
              <button
                key={marca.id_marca}
                onClick={() => { setActiveMarcaId(marca.id_marca); setPage(1); }}
                aria-pressed={activeMarcaId === marca.id_marca}
                className={marcaButtonClass(activeMarcaId === marca.id_marca)}
              >
                {marca.descripcion_marca}
              </button>
            ))}
            {!activeMarcaId && availableMarcas.length > 4 && (
              <button
                onClick={() => setShowMoreMarcas(!showMoreMarcas)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-accent/10 text-accent hover:bg-accent/20 inline-flex items-center gap-1"
              >
                {showMoreMarcas ? "Menos" : `Ver más (${availableMarcas.length - 4})`}
                {showMoreMarcas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        )}
        {availableMarcas.length === 1 && (
          <p className="text-sm text-muted-foreground mb-4">
            Marca: <span className="font-medium text-foreground">{availableMarcas[0].descripcion_marca}</span>
          </p>
        )}
        </div>

        {/* Chips de filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                Búsqueda: “{debouncedSearch}”
                <button onClick={() => { setSearch(""); setDebouncedSearch(""); }} className="ml-0.5 hover:text-primary/70" aria-label="Quitar búsqueda">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeRubroId && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                Rubro: {activeCategory}
                <button onClick={() => { setActiveRubroId(null); setActiveViscosidadId(null); setActiveMarcaId(null); setPage(1); }} className="ml-0.5 hover:text-primary/70" aria-label="Quitar rubro">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeViscosidadName && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                Viscosidad: {activeViscosidadName}
                <button onClick={() => { setActiveViscosidadId(null); setPage(1); }} className="ml-0.5 hover:text-primary/70" aria-label="Quitar viscosidad">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeMarcaName && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                Marca: {activeMarcaName}
                <button onClick={() => { setActiveMarcaId(null); setPage(1); }} className="ml-0.5 hover:text-primary/70" aria-label="Quitar marca">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => { setSearch(""); setDebouncedSearch(""); setActiveRubroId(null); setActiveViscosidadId(null); setActiveMarcaId(null); setPage(1); }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {(articulosLoading || marcasLoading || rubrosLoading) && (
          <div className="mb-4 overflow-hidden rounded-full h-1 bg-secondary">
            <div className="h-full w-1/3 bg-primary rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]" />
          </div>
        )}

        {viscosidadesLoading && (
          <div className="mb-4 text-sm text-muted-foreground">Cargando viscosidades...</div>
        )}
        {viscosidadesError && (
          <div className="mb-4 text-sm text-destructive">{viscosidadesError}</div>
        )}

        {/* Contador de resultados */}
        {!articulosLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            {displayedArticulos.length > 0
              ? `Mostrando ${Math.min(paginatedArticulos.length, displayedArticulos.length)} de ${displayedArticulos.length} productos`
              : "0 productos encontrados"}
          </p>
        )}

        {/* Product Grid */}
        <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
          {articulosLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4">
                <Skeleton className="w-full aspect-square rounded-md mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <div className="flex justify-between items-end">
                  <div>
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))
          ) : (
            paginatedArticulos.length > 0 ? (
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
                <p className="text-sm text-muted-foreground mb-4">Intenta buscar otra cosa o explora otras categorías</p>
                <button
                  onClick={() => { setSearch(""); setDebouncedSearch(""); setActiveRubroId(null); setActiveViscosidadId(null); setActiveMarcaId(null); setPage(1); }}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Limpiar filtros
                </button>
              </div>
            )
          )}
          </AnimatePresence>
        </div>

        {/* Cargar más */}
        {hasMore && !articulosLoading && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-all"
            >
              Cargar más productos ({displayedArticulos.length - paginatedArticulos.length} restantes)
            </button>
          </div>
        )}

        
      </main>

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
            title="Volver arriba"
            className="fixed right-5 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-2xl shadow-primary/30 ring-1 ring-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={lubrimecLogo} alt="Lubrimec" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold tracking-wider text-foreground">LUBRIMEC</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-muted-foreground text-sm sm:flex-row sm:gap-6">
            <span className="flex items-center gap-2 text-center">
              <Phone className="w-4 h-4" />
              <span className="block">+595 974 759 037</span>
            </span>
            <a
              href="https://wa.me/595974759037"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir chat de WhatsApp"
              title="Abrir WhatsApp"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5">
                <path fill="#fff" d="M16.03 3C9.22 3 3.98 8.24 3.98 15.05c0 2.65.86 5.1 2.34 7.11L3 29l6.18-3.29c1.86 1.03 3.98 1.59 6.85 1.59 6.81 0 12.05-5.24 12.05-12.05S22.84 3 16.03 3zm6.87 18.22c-.26.73-1.49 1.39-2.07 1.47-.54.08-1.2.12-2.98-.44-2.57-.86-4.23-2.98-4.36-3.13-.13-.16-1.04-1.22-1.04-2.33 0-1.11.64-1.66.87-1.89.23-.23.5-.26.68-.26.17 0 .35 0 .5.01.16.01.38-.06.59.45.21.51.71 1.76.77 1.9.06.14.1.3.02.48-.08.18-.12.3-.24.46-.12.16-.26.36-.36.49-.12.16-.24.34-.1.57.14.23.62 1.02 1.33 1.65.92.82 1.69 1.2 2.01 1.34.32.14.51.12.7-.07.19-.19.83-.98 1.05-1.32.22-.34.43-.28.72-.17.29.11 1.83.86 2.14 1.01.31.15.52.23.6.36.08.13.08.76-.18 1.49z"/>
              </svg>
              Chateá con nosotros
            </a>

            <span className="flex items-center gap-2 text-center">
              <MapPin className="w-4 h-4" />
              <span className="block">Capiata Ruta 2 Km 20, Paraguay</span>
              <a
                href="https://maps.app.goo.gl/yvJk2A8PbadJKpwQ7"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir ubicación en Google Maps"
                title="Abrir en Google Maps"
                className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary/20 text-muted-foreground hover:opacity-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>
                </svg>
              </a>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Lubrimec. Todos los derechos reservados.</p>
        </div>
      </footer>

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

export default Index;
