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
const VISCOSIDADES_ENDPOINT =
  "https://oracleapex.com/ords/josegalvez/paginaweb/viscosidades";
const MARCAS_ENDPOINT =
  "https://oracleapex.com/ords/josegalvez/paginaweb/cotizaMarcas";
const ACEITES_ENDPOINT =
  "https://oracleapex.com/ords/josegalvez/paginaweb/aceites";
const FILTRO_ACEITE_ENDPOINT =
  "https://oracleapex.com/ords/josegalvez/paginaweb/filtroaceite";

type ApiModelo = { modelo: string | null };
type ApiResponse = { items: ApiModelo[] };
type ApiViscosidad = {
  id_viscosidad: number;
  descripcion: string;
  motor_caja: string;
};
type ViscosidadesResponse = { items: ApiViscosidad[] };
type ApiMarca = {
  aceite: string;
  id_marca: number;
};
type MarcasResponse = { items: ApiMarca[] };
type ApiAceite = {
  articulo: string;
  id_articulo: number;
};
type AceitesResponse = { items: ApiAceite[] };
type ApiFiltroAceite = {
  descripcion: string;
  id_marca: number;
};
type FiltroAceiteResponse = { items: ApiFiltroAceite[] };

type TipoServicio = "motor" | "caja";
type Existencia = "stock" | "todos";

export default function Cotizador() {
  const [modelos, setModelos] = useState<string[]>([]);
  const [viscosidades, setViscosidades] = useState<ApiViscosidad[]>([]);
  const [marcas, setMarcas] = useState<ApiMarca[]>([]);
  const [aceites, setAceites] = useState<ApiAceite[]>([]);
  const [filtrosAceite, setFiltrosAceite] = useState<ApiFiltroAceite[]>([]);
  const [loading, setLoading] = useState(true);
  const [viscosidadesLoading, setViscosidadesLoading] = useState(false);
  const [marcasLoading, setMarcasLoading] = useState(false);
  const [aceitesLoading, setAceitesLoading] = useState(false);
  const [filtrosLoading, setFiltrosLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [tipoServicio, setTipoServicio] = useState<TipoServicio>("motor");
  const [selectedViscosidad, setSelectedViscosidad] = useState<number | null>(
    null
  );
  const [existencia, setExistencia] = useState<Existencia>("todos");
  const [selectedMarca, setSelectedMarca] = useState<number | null>(null);
  const [selectedAceites, setSelectedAceites] = useState<number[]>([]);
  const [selectedFiltro, setSelectedFiltro] = useState<number | null>(null);

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

  const fetchViscosidades = async () => {
    setViscosidadesLoading(true);
    try {
      const res = await fetch(VISCOSIDADES_ENDPOINT);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ViscosidadesResponse = await res.json();
      setViscosidades(data.items);
      setSelectedViscosidad(null);
    } catch (e) {
      console.error("Error cargando viscosidades:", e);
    } finally {
      setViscosidadesLoading(false);
    }
  };

  const fetchMarcas = async (viscosidadDescripcion: string) => {
    setMarcasLoading(true);
    setSelectedMarca(null);
    setAceites([]);
    setSelectedAceites([]);
    try {
      const existenciaParam = existencia === "stock" ? 1 : 0;
      const url = `${MARCAS_ENDPOINT}/${existenciaParam}/${viscosidadDescripcion}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: MarcasResponse = await res.json();
      setMarcas(data.items);
    } catch (e) {
      console.error("Error cargando marcas:", e);
      setMarcas([]);
    } finally {
      setMarcasLoading(false);
    }
  };

  const fetchAceites = async (
    viscosidadDescripcion: string,
    idMarca: number
  ) => {
    setAceitesLoading(true);
    setSelectedAceites([]);
    try {
      const existenciaParam = existencia === "stock" ? 1 : 0;
      const url = `${ACEITES_ENDPOINT}/${existenciaParam}/${viscosidadDescripcion}/${idMarca}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AceitesResponse = await res.json();
      setAceites(data.items);
    } catch (e) {
      console.error("Error cargando aceites:", e);
      setAceites([]);
    } finally {
      setAceitesLoading(false);
    }
  };

  useEffect(() => {
    fetchModelos();
    fetchViscosidades();
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

  const filteredViscosidades = useMemo(() => {
    const filterValue = tipoServicio === "motor" ? "M" : "C";
    return viscosidades.filter((v) => v.motor_caja === filterValue);
  }, [viscosidades, tipoServicio]);

  // Cargar marcas cuando cambia viscosidad o existencia
  useEffect(() => {
    if (selectedViscosidad) {
      const viscosidadData = viscosidades.find(
        (v) => v.id_viscosidad === selectedViscosidad
      );
      if (viscosidadData) {
        fetchMarcas(viscosidadData.descripcion);
      }
    }
  }, [selectedViscosidad, existencia, viscosidades]);

  // Cargar aceites cuando cambia marca
  useEffect(() => {
    if (selectedMarca && selectedViscosidad) {
      const viscosidadData = viscosidades.find(
        (v) => v.id_viscosidad === selectedViscosidad
      );
      if (viscosidadData) {
        fetchAceites(viscosidadData.descripcion, selectedMarca);
      }
    }
  }, [selectedMarca, selectedViscosidad, existencia, viscosidades]);

  const toggleAceite = (id: number) => {
    setSelectedAceites((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const fetchFiltrosAceite = async (modelo: string) => {
    setFiltrosLoading(true);
    setSelectedFiltro(null);
    try {
      const url = `${FILTRO_ACEITE_ENDPOINT}/${encodeURIComponent(modelo)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: FiltroAceiteResponse = await res.json();
      setFiltrosAceite(data.items);

      // Si hay un único filtro, seleccionarlo por defecto
      if (data.items.length === 1) {
        setSelectedFiltro(data.items[0].id_marca);
      }
    } catch (e) {
      console.error("Error cargando filtros de aceite:", e);
      setFiltrosAceite([]);
    } finally {
      setFiltrosLoading(false);
    }
  };

  const handleSelect = (modelo: string) => {
    setSelected(modelo);
    setQuery(modelo);
    setOpen(false);
    fetchFiltrosAceite(modelo);
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

          {/* Tipo de servicio */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" /> Tipo de servicio
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                ¿Para qué sistema necesitás el aceite?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "motor", label: "Motor", icon: "🔧" },
                    { value: "caja", label: "Caja", icon: "⚙️" },
                  ] as { value: TipoServicio; label: string; icon: string }[]
                ).map(({ value, label, icon }) => {
                  const active = tipoServicio === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTipoServicio(value)}
                      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-5 px-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                        active
                          ? "border-primary bg-primary/10 text-primary shadow-md scale-[1.03]"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <span className="text-2xl leading-none">{icon}</span>
                      <span>{label}</span>
                      {active && (
                        <span className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Viscosidades */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" /> Viscosidad
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Seleccioná la viscosidad del aceite
              </p>
              {viscosidadesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredViscosidades.map((visc) => {
                    const active = selectedViscosidad === visc.id_viscosidad;
                    return (
                      <button
                        key={visc.id_viscosidad}
                        type="button"
                        onClick={() => setSelectedViscosidad(visc.id_viscosidad)}
                        className={`relative rounded-xl border-2 py-3 px-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                          active
                            ? "border-primary bg-primary/10 text-primary shadow-md"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary/40 hover:text-foreground"
                        }`}
                      >
                        {visc.descripcion}
                        {active && (
                          <span className="absolute top-1 right-1">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Existencia */}
          {selected && selectedViscosidad && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Existencia
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                ¿Qué productos deseas ver?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { value: "stock", label: "Con Stock", icon: "📦" },
                    { value: "todos", label: "Todos", icon: "📋" },
                  ] as { value: Existencia; label: string; icon: string }[]
                ).map(({ value, label, icon }) => {
                  const active = existencia === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setExistencia(value)}
                      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-5 px-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                        active
                          ? "border-primary bg-primary/10 text-primary shadow-md scale-[1.03]"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary/40 hover:text-foreground"
                      }`}
                    >
                      <span className="text-2xl leading-none">{icon}</span>
                      <span>{label}</span>
                      {active && (
                        <span className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Marcas */}
          {selected && selectedViscosidad && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" /> Marca
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Seleccioná la marca del aceite
              </p>
              {marcasLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : marcas.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay marcas disponibles para esta viscosidad
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {marcas.map((marca) => {
                    const active = selectedMarca === marca.id_marca;
                    return (
                      <button
                        key={marca.id_marca}
                        type="button"
                        onClick={() => setSelectedMarca(marca.id_marca)}
                        className={`relative rounded-xl border-2 py-3 px-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                          active
                            ? "border-primary bg-primary/10 text-primary shadow-md"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary/40 hover:text-foreground"
                        }`}
                      >
                        {marca.aceite}
                        {active && (
                          <span className="absolute top-1 right-1">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Aceites */}
          {selected && selectedViscosidad && selectedMarca && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" /> Productos
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Seleccioná los productos que deseas cotizar
              </p>
              {aceitesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : aceites.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay productos disponibles
                </div>
              ) : (
                <div className="space-y-2">
                  {aceites.map((aceite) => (
                    <label
                      key={aceite.id_articulo}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-border bg-card hover:bg-secondary/40 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAceites.includes(aceite.id_articulo)}
                        onChange={() => toggleAceite(aceite.id_articulo)}
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {aceite.articulo}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Marca del filtro de aceite */}
          {selected && selectedAceites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" /> Marca del filtro
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Seleccioná la marca del filtro de aceite
              </p>
              {filtrosLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : filtrosAceite.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay marcas disponibles para este modelo
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filtrosAceite.map((filtro) => {
                    const active = selectedFiltro === filtro.id_marca;
                    return (
                      <button
                        key={filtro.id_marca}
                        type="button"
                        onClick={() => setSelectedFiltro(filtro.id_marca)}
                        className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-5 px-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                          active
                            ? "border-primary bg-primary/10 text-primary shadow-md scale-[1.03]"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary/40 hover:text-foreground"
                        }`}
                      >
                        <span>{filtro.descripcion}</span>
                        {active && (
                          <span className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

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
                  <p className="text-sm font-bold text-foreground">{selected}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Servicio:{" "}
                    <span className="text-primary font-semibold capitalize">
                      {tipoServicio}
                    </span>
                  </p>
                  {selectedViscosidad && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Viscosidad:{" "}
                      <span className="text-primary font-semibold">
                        {filteredViscosidades.find(
                          (v) => v.id_viscosidad === selectedViscosidad
                        )?.descripcion}
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Existencia:{" "}
                    <span className="text-primary font-semibold capitalize">
                      {existencia === "stock" ? "Con Stock" : "Todos"}
                    </span>
                  </p>
                  {selectedMarca && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Marca:{" "}
                      <span className="text-primary font-semibold">
                        {marcas.find((m) => m.id_marca === selectedMarca)?.aceite}
                      </span>
                    </p>
                  )}
                  {selectedAceites.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Productos:{" "}
                      <span className="text-primary font-semibold">
                        {selectedAceites.length} seleccionado
                        {selectedAceites.length !== 1 ? "s" : ""}
                      </span>
                    </p>
                  )}
                  {selectedAceites.length > 0 && selectedFiltro && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Marca del filtro:{" "}
                      <span className="text-primary font-semibold">
                        {filtrosAceite.find(
                          (f) => f.id_marca === selectedFiltro
                        )?.descripcion}
                      </span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </main>
    </div>
  );
}
