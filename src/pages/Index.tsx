import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Droplets, Phone, MapPin } from "lucide-react";
// local product fixtures removed
import { useArticulos } from "@/hooks/useArticulos";
import ArticleCard from "@/components/ArticleCard";
import { useRubros } from "@/hooks/useRubros";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [activeRubroId, setActiveRubroId] = useState<number | null>(null);
  const [showMoreRubros, setShowMoreRubros] = useState(false);
  const { rubros, loading: rubrosLoading, error: rubrosError } = useRubros();

  const TOP_RUBROS_IDS = [1, 7, 8, 13];
  const topRubros = rubros.filter((r) => TOP_RUBROS_IDS.includes(r.id_rubro));
  const otherRubros = rubros.filter((r) => !TOP_RUBROS_IDS.includes(r.id_rubro));

  const filtered = [];

  const { articulos, loading: articulosLoading, error: articulosError } = useArticulos();
  const q = search.toLowerCase().trim();
  // Mostrar todos los artículos que devuelve la API, filtrando solo por el texto de búsqueda
  const displayedArticulos = articulos.filter((a) => {
    const descripcion = (a.descripcion_articulo || "").toLowerCase();
    const matchesSearch = q === "" ? true : descripcion.includes(q);
    const matchesRubro = activeRubroId ? a.id_rubro === activeRubroId : true;
    return matchesSearch && matchesRubro;
  });

  

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative h-[70vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img src={heroBanner} alt="Lubrimec taller" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Droplets className="w-10 h-10 text-primary" />
            <h1 className="text-7xl md:text-8xl font-bold text-foreground tracking-wider">LUBRIMEC</h1>
            <Droplets className="w-10 h-10 text-primary" />
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground font-sans font-light tracking-wide">
            Tu lubricentro de confianza â€” CatÃ¡logo de productos
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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setActiveCategory("Todos");
                setActiveRubroId(null);
                setShowMoreRubros(false);
              }}
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
                          onClick={() => {
                            console.debug("rubros: clicked", rubro.id_rubro, rubro.descripcion_rubro);
                            setActiveRubroId(rubro.id_rubro);
                            setActiveCategory(rubro.descripcion_rubro);
                          }}
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
                      onClick={() => {
                        setActiveRubroId(rubro.id_rubro);
                        setActiveCategory(rubro.descripcion_rubro);
                      }}
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

        {/* Product Grid - ahora mostramos artículos de la API (incluye filtro por rubro y búsqueda) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articulosLoading ? (
            <div className="col-span-3 text-center">{"Cargando art\u00EDculos..."}</div>
          ) : (
            displayedArticulos.length > 0 ? (
              displayedArticulos.map((art) => <ArticleCard key={art.id_articulo} articulo={art as any} />)
            ) : (
              <div className="col-span-3 text-center">{"No se encontraron art\u00EDculos."}</div>
            )
          )}
        </div>

        
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold tracking-wider text-foreground">LUBRIMEC</span>
          </div>
          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> +595 984 759 037</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Capiata Ruta 2 Km 20, Paraguay</span>
          </div>
          <p className="text-xs text-muted-foreground">Â© 2026 Lubrimec. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Modal removed (no local product modal used) */}
    </div>
  );
};

export default Index;
