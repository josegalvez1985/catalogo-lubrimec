import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Car,
  Search,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  ChevronDown,
} from "lucide-react";

const MODELOS_ENDPOINT =
  "https://oracleapex.com/ords/josegalvez/paginaweb/cotizaModelos";

type ApiModelo = { modelo: string | null };
type ApiResponse = { items: ApiModelo[] };

export default function Cotizador() {
  const [modelos, setModelos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchModelos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(MODELOS_ENDPOINT);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();
      const lista = data.items
        .map((i) => i.modelo)
        .filter((m): m is string => !!m && m.trim().length > 0)
        .map((m) => m.trim())
        .sort((a, b) => a.localeCompare(b, "es"));
      setModelos(lista);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelos();
  }, []);

  // Cierra el dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return modelos;
    return modelos.filter((m) => m.toLowerCase().includes(q));
  }, [modelos, query]);

  const handleSelect = (modelo: string) => {
    setSelected(modelo);
    setQuery(modelo);
    setOpen(false);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="pt-24 pb-8 px-4 bg-gradient-to-b from-card/40 to-transparent border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                Herramienta interactiva
              </p>
              <h1
                className="text-3xl md:text-4xl font-bold text-foreground"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                COTIZADOR
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-sm ml-13">
            Seleccioná el modelo de tu vehículo para comenzar la cotización.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" /> Modelo del vehículo
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Escribí para buscar y elegí tu modelo de la lista.
          </p>

          {/* Combobox */}
          <div ref={wrapperRef} className="relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                  if (selected && e.target.value !== selected) {
                    setSelected(null);
                  }
                }}
                onFocus={() => setOpen(true)}
                placeholder={
                  loading
                    ? "Cargando modelos…"
                    : "Buscar modelo (ej: Toyota Vitz, Kia Sportage…)"
                }
                disabled={loading || !!error}
                className="w-full bg-card border border-border rounded-xl py-3 pl-11 pr-20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition disabled:opacity-50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {query && !loading && !error && (
                  <button
                    onClick={handleClear}
                    aria-label="Limpiar"
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : !error ? (
                  <button
                    onClick={() => {
                      setOpen((o) => !o);
                      inputRef.current?.focus();
                    }}
                    aria-label="Abrir lista"
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Dropdown */}
            {open && !loading && !error && (
              <div className="absolute z-20 mt-2 w-full rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
                <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border bg-secondary/30">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "modelo" : "modelos"}
                  {query && filtered.length > 0 && ` · "${query}"`}
                </div>
                {filtered.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Sin coincidencias para "{query}"
                  </div>
                ) : (
                  <ul className="max-h-72 overflow-y-auto divide-y divide-border">
                    {filtered.map((modelo) => {
                      const active = selected === modelo;
                      return (
                        <li key={modelo}>
                          <button
                            onClick={() => handleSelect(modelo)}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 text-sm transition-colors ${
                              active
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-secondary/40"
                            }`}
                          >
                            <span className="font-medium">{modelo}</span>
                            {active && (
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {error && !loading && (
            <div className="mt-4 flex flex-col items-center justify-center py-8 px-4 rounded-2xl border border-red-500/30 bg-red-500/5 text-center">
              <AlertCircle className="w-7 h-7 text-red-400 mb-2" />
              <p className="text-sm font-semibold text-foreground mb-1">
                No se pudieron cargar los modelos
              </p>
              <p className="text-xs text-muted-foreground mb-4">{error}</p>
              <button
                onClick={fetchModelos}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
              >
                <RefreshCw className="w-4 h-4" /> Reintentar
              </button>
            </div>
          )}

          {/* Selected summary */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mt-6 p-4 rounded-2xl border border-primary/30 bg-primary/5 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">
                    Modelo seleccionado
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {selected}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </main>
    </div>
  );
}
