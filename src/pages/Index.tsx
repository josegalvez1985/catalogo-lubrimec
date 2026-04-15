import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Search, Phone, MapPin } from "lucide-react";
// local product fixtures removed
import { useArticulos } from "@/hooks/useArticulos";
import { useViscosidades } from "@/hooks/useViscosidades";
import ArticleCard from "@/components/ArticleCard";
import ProductModal from "@/components/ProductModal";
import { useRubros } from "@/hooks/useRubros";
import type { Articulo } from "@/hooks/useArticulos";
import heroBanner from "@/assets/hero-banner.jpg";
import lubrimecLogo from "@/assets/lubrimec-logo.png";

const Index = () => {
    // Estado para paginación
    const [page, setPage] = useState(1);
  const pageSize = 16;
  
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [activeRubroId, setActiveRubroId] = useState<number | null>(null);
  const [activeViscosidadId, setActiveViscosidadId] = useState<number | null>(null);
  const [selectedArticulo, setSelectedArticulo] = useState<Articulo | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Reiniciar página cuando cambian los filtros
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleCategoryClick = (categoria: string) => {
    setActiveCategory(categoria);
    setActiveRubroId(null);
    setActiveViscosidadId(null);
    setPage(1);
  };
  const handleRubroClick = (rubroId: number, descripcion: string) => {
    setActiveRubroId(rubroId);
    setActiveCategory(descripcion);
    setActiveViscosidadId(null);
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      setShowScrollTop(scrollY > 360);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Artículos del rubro activo que tienen viscosidad
  const articulosDelRubro = activeRubroId
    ? articulos.filter(a => a.id_rubro === activeRubroId && a.id_viscosidad != null)
    : [];

  // IDs de viscosidad presentes en artículos del rubro seleccionado
  const viscosidadIdsDelRubro = new Set(articulosDelRubro.map(a => a.id_viscosidad!));

  // Solo mostrar viscosidades que existan en los artículos del rubro activo
  const viscosidadesDisponibles = activeRubroId
    ? viscosidades.filter(v => viscosidadIdsDelRubro.has(v.id_viscosidad))
    : [];

  const q = search.toLowerCase().trim();
  // Mostrar todos los artículos, filtrando por texto, rubro y viscosidad seleccionada
  const displayedArticulos = articulos.filter((a) => {
    const descripcion = (a.descripcion_articulo || "").toLowerCase();
    const matchesSearch = q === "" ? true : descripcion.includes(q);
    const matchesRubro = activeRubroId ? a.id_rubro === activeRubroId : true;
    const matchesViscosidad = activeViscosidadId ? a.id_viscosidad === activeViscosidadId : true;
    return matchesSearch && matchesRubro && matchesViscosidad;
  });

  // Paginación: solo mostrar los artículos de la página actual
  const paginatedArticulos = displayedArticulos.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(displayedArticulos.length / pageSize);

  

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        <img src={heroBanner} alt="Lubrimec taller" className="absolute inset-0 w-full h-full object-cover" />
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
        </motion.div>
      </header>

      {/* Filters */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleCategoryClick("Todos")}
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
                {topRubros.map((rubro) => {
                      return (
                        <button
                          key={rubro.id_rubro}
                          onClick={() => handleRubroClick(rubro.id_rubro, rubro.descripcion_rubro)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            activeCategory === rubro.descripcion_rubro
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {rubro.descripcion_rubro}
                        </button>
                      );
                    })}

                {!showMoreRubros && otherRubros.length > 0 && (
                  <button
                    onClick={() => setShowMoreRubros(true)}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    {"M\u00E1s"}
                  </button>
                )}

                {showMoreRubros &&
                  otherRubros.map((rubro) => (
                    <button
                      key={rubro.id_rubro}
                      onClick={() => handleRubroClick(rubro.id_rubro, rubro.descripcion_rubro)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeCategory === rubro.descripcion_rubro
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {rubro.descripcion_rubro}
                    </button>
                  ))}
              </>
            )}
          </div>
        </div>

        {viscosidadesDisponibles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-2 py-2 text-sm font-semibold text-muted-foreground">Viscosidad:</span>
            <button
              onClick={() => { setActiveViscosidadId(null); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !activeViscosidadId
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Todas
            </button>
            {viscosidadesDisponibles.map((v) => (
              <button
                key={v.id_viscosidad}
                onClick={() => handleViscosidadClick(v.id_viscosidad)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeViscosidadId === v.id_viscosidad
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {v.descripcion}
              </button>
            ))}
          </div>
        )}

        {viscosidadesLoading && (
          <div className="mb-4 text-sm text-muted-foreground">Cargando viscosidades...</div>
        )}
        {viscosidadesError && (
          <div className="mb-4 text-sm text-destructive">{viscosidadesError}</div>
        )}

        {/* Product Grid - ahora mostramos artículos de la API (incluye filtro por rubro y búsqueda) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {articulosLoading ? (
            <div className="col-span-3 text-center">{"Cargando artículos..."}</div>
          ) : (
            paginatedArticulos.length > 0 ? (
              paginatedArticulos.map((art) => (
                <div key={art.id_articulo} className="cursor-pointer" onClick={() => setSelectedArticulo(art)}>
                  <ArticleCard articulo={art as any} />
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center">{"No se encontraron art\u00EDculos."}</div>
            )
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              className="px-4 py-2 rounded bg-secondary text-secondary-foreground disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button
              className="px-4 py-2 rounded bg-secondary text-secondary-foreground disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}

        
      </main>

      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ y: -2, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver arriba"
          title="Volver al inicio"
          className="fixed right-5 bottom-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-3 text-primary-foreground shadow-2xl shadow-primary/30 ring-1 ring-primary/20 transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 shadow-sm">
            <ArrowUp className="h-5 w-5" />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-xs uppercase tracking-[0.18em] text-primary-foreground/80">Desplaza</span>
            <span className="text-sm font-semibold">Arriba</span>
          </div>
        </motion.button>
      )}

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
              <a
                href="https://wa.me/595974759037"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir chat de WhatsApp"
                title="Abrir WhatsApp"
                className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white hover:opacity-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-4 h-4">
                  <path fill="#fff" d="M16.03 3C9.22 3 3.98 8.24 3.98 15.05c0 2.65.86 5.1 2.34 7.11L3 29l6.18-3.29c1.86 1.03 3.98 1.59 6.85 1.59 6.81 0 12.05-5.24 12.05-12.05S22.84 3 16.03 3zm6.87 18.22c-.26.73-1.49 1.39-2.07 1.47-.54.08-1.2.12-2.98-.44-2.57-.86-4.23-2.98-4.36-3.13-.13-.16-1.04-1.22-1.04-2.33 0-1.11.64-1.66.87-1.89.23-.23.5-.26.68-.26.17 0 .35 0 .5.01.16.01.38-.06.59.45.21.51.71 1.76.77 1.9.06.14.1.3.02.48-.08.18-.12.3-.24.46-.12.16-.26.36-.36.49-.12.16-.24.34-.1.57.14.23.62 1.02 1.33 1.65.92.82 1.69 1.2 2.01 1.34.32.14.51.12.7-.07.19-.19.83-.98 1.05-1.32.22-.34.43-.28.72-.17.29.11 1.83.86 2.14 1.01.31.15.52.23.6.36.08.13.08.76-.18 1.49z"/>
                </svg>
              </a>
            </span>

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
      />
    </div>
  );
};

export default Index;
