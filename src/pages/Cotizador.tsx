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
  Calculator,
} from "lucide-react";
import QuotationModal from "@/components/QuotationModal";
import type { QuotationData } from "@/lib/quotationCanvas";
import { useArticulos } from "@/hooks/useArticulos";

// CORS Proxy para desarrollo (comentar en producción)
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
const USE_CORS_PROXY = false; // Cambiar a true si hay problemas CORS

const BASE_URL = "https://oracleapex.com/ords/josegalvez/paginaweb";
const getProxiedUrl = (url: string) =>
  USE_CORS_PROXY ? `${CORS_PROXY}${url}` : url;

const MODELOS_ENDPOINT = getProxiedUrl(`${BASE_URL}/cotizaModelos`);
const VISCOSIDADES_ENDPOINT = getProxiedUrl(`${BASE_URL}/viscosidades`);
const MARCAS_ENDPOINT = getProxiedUrl(`${BASE_URL}/cotizaMarcas`);
const ACEITES_ENDPOINT = getProxiedUrl(`${BASE_URL}/aceites`);
const FILTRO_ACEITE_ENDPOINT = getProxiedUrl(`${BASE_URL}/filtroaceite`);
const FILTRO_AIRE_ENDPOINT = getProxiedUrl(`${BASE_URL}/filtroaire`);
const FILTRO_COMBUSTIBLE_ENDPOINT = getProxiedUrl(`${BASE_URL}/filtrocombustible`);
const FILTRO_CAJA_ENDPOINT = getProxiedUrl(`${BASE_URL}/filtrocaja`);
const COTIZACION_ENDPOINT = getProxiedUrl(BASE_URL);

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
  id_articulo?: number;
};
type FiltroAceiteResponse = { items: ApiFiltroAceite[] };
type ApiFiltroAire = {
  descripcion: string;
  id_marca: number;
  id_articulo?: number;
};
type FiltroAireResponse = { items: ApiFiltroAire[] };
type ApiFiltroCombustible = {
  descripcion: string;
  id_marca: number;
  id_articulo?: number;
};
type FiltroCombustibleResponse = { items: ApiFiltroCombustible[] };
type ApiFiltroCaja = {
  descripcion: string;
  id_marca: number;
  id_articulo?: number;
};
type FiltroCajaResponse = { items: ApiFiltroCaja[] };

type TipoServicio = "motor" | "caja";
type Existencia = "stock" | "todos";

type CotizacionAPIResponse = {
  resultado?: {
    aceites: Array<{
      id: number;
      nombre: string;
      precioBase: number;
      precioDescuento: number;
      totalLista: number;
      totalDescuento: number;
      stock: number;
      unidad: string;
      imagen?: {
        nombre: string;
        mimeType: string;
        datos?: string;
      };
    }>;
    filtros: {
      aceite?: { id: number; idArticulo?: number; nombre: string; precio: number; imagen?: any };
      aire?: { id: number; idArticulo?: number; nombre: string; precio: number; imagen?: any };
      combustible?: { id: number; idArticulo?: number; nombre: string; precio: number; imagen?: any };
      caja?: { id: number; idArticulo?: number; nombre: string; precio: number; imagen?: any };
    };
    totales: {
      sinDescuento: number;
      conDescuento: number;
      porcentajeDescuento: number;
    };
  };
};

type RawCotizacionItem = {
  articulo: string;
  descripcion: string;
  viscosidad: string;
  total_aceite: number;
  cod_unidad_medida: string;
  modelo: string;
  filtro_caja: number;
  filtro_aceite: number;
  filtro_aire: number;
  filtro_combustible: number;
  total: string;
  total_descuento: number;
  cantidad: string;
  id_articulo: number;
  stock: number;
  descuento: string;
};

type RawCotizacionResponse = { items: RawCotizacionItem[] };

const parseMonto = (s: string | number): number => {
  if (typeof s === "number") return s;
  return Number(String(s).replace(/[^\d-]/g, "")) || 0;
};

export default function Cotizador() {
  const { articulos: catalogoArticulos } = useArticulos();
  const precioBrutoPorId = useMemo(
    () => new Map(catalogoArticulos.map((a) => [a.id_articulo, a.precio ?? null])),
    [catalogoArticulos]
  );
  const stockPorId = useMemo(
    () =>
      new Map(
        catalogoArticulos.map((a) => [
          a.id_articulo,
          { stock: a.stock ?? 0, unidad: ((a as any).cod_unidad_medida as string) ?? "" },
        ])
      ),
    [catalogoArticulos]
  );

  // Filtra aceites cuyo stock cubra la cantidad pedida según su unidad (LT→litros, GAL→galones)
  const filtrarPorStock = (id: number) => {
    if (existencia === "todos") return true; // mostrar todos, sin controlar cantidades
    const info = stockPorId.get(id);
    if (!info) return true; // sin dato de catálogo, no filtrar
    const litros = parseFloat(cantidadLitros || "0") || 0;
    const galones = parseFloat(cantidadGalones || "0") || 0;
    const requerido = info.unidad === "GAL" ? galones : litros;
    return info.stock >= requerido;
  };

  const [modelos, setModelos] = useState<string[]>([]);
  const [viscosidades, setViscosidades] = useState<ApiViscosidad[]>([]);
  const [marcas, setMarcas] = useState<ApiMarca[]>([]);
  const [aceites, setAceites] = useState<ApiAceite[]>([]);
  const [filtrosAceite, setFiltrosAceite] = useState<ApiFiltroAceite[]>([]);
  const [filtrosAire, setFiltrosAire] = useState<ApiFiltroAire[]>([]);
  const [filtrosCombustible, setFiltrosCombustible] = useState<
    ApiFiltroCombustible[]
  >([]);
  const [filtrosCaja, setFiltrosCaja] = useState<ApiFiltroCaja[]>([]);
  const [loading, setLoading] = useState(true);
  const [viscosidadesLoading, setViscosidadesLoading] = useState(false);
  const [marcasLoading, setMarcasLoading] = useState(false);
  const [aceitesLoading, setAceitesLoading] = useState(false);
  const [filtrosLoading, setFiltrosLoading] = useState(false);
  const [filtrosAireLoading, setFiltrosAireLoading] = useState(false);
  const [filtrosCombustibleLoading, setFiltrosCombustibleLoading] =
    useState(false);
  const [filtrosCajaLoading, setFiltrosCajaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [tipoServicio, setTipoServicio] = useState<TipoServicio>("motor");
  const [selectedViscosidad, setSelectedViscosidad] = useState<number | null>(
    null
  );
  const [existencia, setExistencia] = useState<Existencia>("stock");
  const [selectedMarca, setSelectedMarca] = useState<number | null>(null);
  const [selectedAceites, setSelectedAceites] = useState<number[]>([]);
  const [selectedFiltro, setSelectedFiltro] = useState<number | null>(null);
  const [selectedFiltroAire, setSelectedFiltroAire] = useState<number | null>(
    null
  );
  const [selectedFiltroCombustible, setSelectedFiltroCombustible] = useState<
    number | null
  >(null);
  const [selectedFiltroCaja, setSelectedFiltroCaja] = useState<number | null>(
    null
  );
  const [descuento, setDescuento] = useState<string>("30");
  const [cantidadLitros, setCantidadLitros] = useState<string>("4");
  const [cantidadGalones, setCantidadGalones] = useState<string>("1");
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [cotizacionAPI, setCotizacionAPI] = useState<CotizacionAPIResponse | null>(null);
  const [rawCotizacionItems, setRawCotizacionItems] = useState<RawCotizacionItem[]>([]);
  const [loadingCotizacion, setLoadingCotizacion] = useState(false);
  const [quotationDataForModal, setQuotationDataForModal] = useState<QuotationData | null>(null);

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

  // Construir datos para el modal
  const quotationData: QuotationData | null = useMemo(() => {
    if (!selected || selectedAceites.length === 0) return null;

    const items = rawCotizacionItems.map((it) => ({
      id: it.id_articulo,
      nombre: it.articulo.replace(/-\d+$/, "").trim(),
      modelo: it.modelo,
      precioAceite: it.total_aceite,
      filtroAceite: it.filtro_aceite || undefined,
      filtroAire: it.filtro_aire || undefined,
      filtroCombustible: it.filtro_combustible || undefined,
      filtroCaja: it.filtro_caja || undefined,
      total: parseMonto(it.total),
      descuentoMonto: parseMonto(it.descuento),
      totalConDescuento: it.total_descuento,
      imagenUrl: `${BASE_URL}/articulosimg/${it.id_articulo}`,
    }));

    return {
      modelo: selected,
      tipoServicio,
      viscosidad:
        filteredViscosidades.find((v) => v.id_viscosidad === selectedViscosidad)
          ?.descripcion || "",
      marca: marcas.find((m) => m.id_marca === selectedMarca)?.aceite || "",
      aceites: aceites
        .filter((a) => selectedAceites.includes(a.id_articulo))
        .map((a) => a.articulo),
      filtros: {
        aceite: filtrosAceite.find((f) => f.id_marca === selectedFiltro)
          ?.descripcion,
        aire: filtrosAire.find((f) => f.id_marca === selectedFiltroAire)
          ?.descripcion,
        combustible: filtrosCombustible.find(
          (f) => f.id_marca === selectedFiltroCombustible
        )?.descripcion,
        caja: filtrosCaja.find((f) => f.id_marca === selectedFiltroCaja)
          ?.descripcion,
      },
      descuento: descuento ? parseFloat(descuento) : undefined,
      items: rawCotizacionItems.length > 0 ? items : undefined,
    };
  }, [
    selected,
    selectedAceites,
    tipoServicio,
    filteredViscosidades,
    selectedViscosidad,
    marcas,
    selectedMarca,
    aceites,
    filtrosAceite,
    selectedFiltro,
    filtrosAire,
    selectedFiltroAire,
    filtrosCombustible,
    selectedFiltroCombustible,
    filtrosCaja,
    selectedFiltroCaja,
    descuento,
    rawCotizacionItems,
  ]);

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

      // Seleccionar el primero por defecto
      if (data.items.length > 0) {
        setSelectedFiltro(data.items[0].id_marca);
      }
    } catch (e) {
      console.error("Error cargando filtros de aceite:", e);
      setFiltrosAceite([]);
    } finally {
      setFiltrosLoading(false);
    }
  };

  const fetchFiltrosAire = async (modelo: string) => {
    setFiltrosAireLoading(true);
    setSelectedFiltroAire(null);
    try {
      const url = `${FILTRO_AIRE_ENDPOINT}/${encodeURIComponent(modelo)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: FiltroAireResponse = await res.json();
      setFiltrosAire(data.items);

      // Seleccionar el primero por defecto
      if (data.items.length > 0) {
        setSelectedFiltroAire(data.items[0].id_marca);
      }
    } catch (e) {
      console.error("Error cargando filtros de aire:", e);
      setFiltrosAire([]);
    } finally {
      setFiltrosAireLoading(false);
    }
  };

  const fetchFiltrosCombustible = async (modelo: string) => {
    setFiltrosCombustibleLoading(true);
    setSelectedFiltroCombustible(null);
    try {
      const url = `${FILTRO_COMBUSTIBLE_ENDPOINT}/${encodeURIComponent(modelo)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: FiltroCombustibleResponse = await res.json();
      setFiltrosCombustible(data.items);

      // Seleccionar el primero por defecto
      if (data.items.length > 0) {
        setSelectedFiltroCombustible(data.items[0].id_marca);
      }
    } catch (e) {
      console.error("Error cargando filtros de combustible:", e);
      setFiltrosCombustible([]);
    } finally {
      setFiltrosCombustibleLoading(false);
    }
  };

  const fetchFiltrosCaja = async (modelo: string) => {
    setFiltrosCajaLoading(true);
    setSelectedFiltroCaja(null);
    try {
      const url = `${FILTRO_CAJA_ENDPOINT}/${encodeURIComponent(modelo)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: FiltroCajaResponse = await res.json();
      setFiltrosCaja(data.items);

      // Seleccionar el primero por defecto
      if (data.items.length > 0) {
        setSelectedFiltroCaja(data.items[0].id_marca);
      }
    } catch (e) {
      console.error("Error cargando filtros de caja:", e);
      setFiltrosCaja([]);
    } finally {
      setFiltrosCajaLoading(false);
    }
  };

  const fetchCotizacionAPI = async () => {
    // Validaciones previas
    if (!selected) {
      alert("Por favor selecciona un modelo");
      return;
    }
    if (selectedAceites.length === 0) {
      alert("Por favor selecciona al menos un producto");
      return;
    }
    if (!selectedViscosidad) {
      alert("Por favor selecciona una viscosidad");
      return;
    }
    if (!selectedMarca) {
      alert("Por favor selecciona una marca");
      return;
    }

    setLoadingCotizacion(true);
    // Alias del state (se sombrea más abajo por un const local llamado "aceites")
    const aceitesDisponibles = aceites;
    try {
      const viscosidadDesc = filteredViscosidades.find(
        (v) => v.id_viscosidad === selectedViscosidad
      )?.descripcion || "";

      // Convertir tipoServicio a formato Oracle: 'motor' → 'M', 'caja' → 'C'
      const tipoServicioOracle = tipoServicio === "motor" ? "M" : "C";
      const existenciaParam = existencia === "stock" ? "1" : "0";
      const idAceitesParam = selectedAceites.join(",");
      const litrosParam = cantidadLitros || "4";
      const galonesParam = cantidadGalones || "1";
      const descuentoParam = descuento ? parseInt(descuento) : 0;

      // El endpoint matchea el modelo CON espacios (igual que los endpoints de filtros)
      const modeloParam = selected;

      // Orden del endpoint:
      // /:idMarcaFiltroCombustible/:modelo/:cantidadGalon/:cantidadLitros/:idMarcaFiltroCaja/:idMarcaFiltroAire/:existencia/:tipoServicio/:idAceites/:viscosidad/:idMarcaFiltroAceite/:descuento
      const pathParams = `${selectedFiltroCombustible || "0"}/${encodeURIComponent(modeloParam)}/${galonesParam}/${litrosParam}/${selectedFiltroCaja || "0"}/${selectedFiltroAire || "0"}/${existenciaParam}/${tipoServicioOracle}/${encodeURIComponent(idAceitesParam)}/${encodeURIComponent(viscosidadDesc)}/${selectedFiltro || "0"}/${descuentoParam}`;

      const url = `${COTIZACION_ENDPOINT}/cotizacion/${pathParams}`;

      // Realizar solicitud con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

      const res = await fetch(url, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}: ${res.statusText}`);
        (err as Error & { status?: number }).status = res.status;
        throw err;
      }

      const raw: RawCotizacionResponse = await res.json();

      // Detectar aceites seleccionados que la API no pudo cotizar (sin precio/stock cargado)
      const idsDevueltos = (raw.items || []).map((it) => it.id_articulo);
      const idsFaltantes = selectedAceites.filter((id) => !idsDevueltos.includes(id));

      if (!raw.items || raw.items.length === 0) {
        throw new Error("Respuesta sin datos de cotización");
      }

      // Si algunos (pero no todos) se cotizaron, avisar cuáles quedaron fuera
      if (idsFaltantes.length > 0) {
        const nombresFaltantes = aceitesDisponibles
          .filter((a) => idsFaltantes.includes(a.id_articulo))
          .map((a) => a.articulo.replace(/-\d+$/, "").trim());
        const lista = nombresFaltantes.length > 0
          ? `:\n• ${nombresFaltantes.join("\n• ")}`
          : ` (IDs: ${idsFaltantes.join(", ")})`;
        alert(
          `Estos productos no se pudieron cotizar y no aparecen en la cotización${lista}.\n\n` +
          "No tienen precio o stock cargado para este modelo. El resto se cotizó normalmente."
        );
      }

      const first = raw.items[0];

      const aceitesCotizados = raw.items.map((it) => {
        const totalLista = parseMonto(it.total);
        return {
          id: it.id_articulo,
          nombre: it.articulo.replace(/-\d+$/, "").trim(),
          // Precio del aceite solo (lista). El descuento se aplica con el % cargado en el front.
          precioBase: it.total_aceite,
          precioDescuento: descuentoParam > 0 ? it.total_aceite * (1 - descuentoParam / 100) : it.total_aceite,
          // Total del item con filtros: lista (it.total) y con descuento calculado en el front.
          totalLista,
          totalDescuento: descuentoParam > 0 ? totalLista * (1 - descuentoParam / 100) : parseMonto(it.total_descuento),
          stock: it.stock,
          unidad: it.cod_unidad_medida,
        };
      });

      const filtros: NonNullable<CotizacionAPIResponse["resultado"]>["filtros"] = {};
      if (tipoServicioOracle === "M") {
        if (first.filtro_aceite > 0 && selectedFiltro) {
          const f = filtrosAceite.find((x) => x.id_marca === selectedFiltro);
          filtros.aceite = { id: selectedFiltro, idArticulo: f?.id_articulo, nombre: f?.descripcion || "Filtro de aceite", precio: first.filtro_aceite };
        }
        if (first.filtro_aire > 0 && selectedFiltroAire) {
          const f = filtrosAire.find((x) => x.id_marca === selectedFiltroAire);
          filtros.aire = { id: selectedFiltroAire, idArticulo: f?.id_articulo, nombre: f?.descripcion || "Filtro de aire", precio: first.filtro_aire };
        }
        if (first.filtro_combustible > 0 && selectedFiltroCombustible) {
          const f = filtrosCombustible.find((x) => x.id_marca === selectedFiltroCombustible);
          filtros.combustible = { id: selectedFiltroCombustible, idArticulo: f?.id_articulo, nombre: f?.descripcion || "Filtro de combustible", precio: first.filtro_combustible };
        }
      } else if (tipoServicioOracle === "C") {
        if (first.filtro_caja > 0 && selectedFiltroCaja) {
          const f = filtrosCaja.find((x) => x.id_marca === selectedFiltroCaja);
          filtros.caja = { id: selectedFiltroCaja, idArticulo: f?.id_articulo, nombre: f?.descripcion || "Filtro de caja", precio: first.filtro_caja };
        }
      }

      const aceitesSum = raw.items.reduce((s, it) => s + (it.total_aceite || 0), 0);
      const filtrosSum =
        (filtros.aceite?.precio || 0) +
        (filtros.aire?.precio || 0) +
        (filtros.combustible?.precio || 0) +
        (filtros.caja?.precio || 0);
      const sinDescuento = aceitesSum + filtrosSum;
      const conDescuento = descuentoParam > 0
        ? Math.round(sinDescuento * (1 - descuentoParam / 100))
        : raw.items.reduce((s, it) => s + parseMonto(it.total_descuento), 0) + filtrosSum;

      const data: CotizacionAPIResponse = {
        resultado: {
          aceites: aceitesCotizados,
          filtros,
          totales: {
            sinDescuento,
            conDescuento,
            porcentajeDescuento: descuentoParam,
          },
        },
      };

      setRawCotizacionItems(raw.items);
      setCotizacionAPI(data);

      // Construir quotationData con items aquí para asegurar que tengan datos
      const quotationDataWithItems: QuotationData = {
        modelo: selected!,
        tipoServicio,
        viscosidad: filteredViscosidades.find(v => v.id_viscosidad === selectedViscosidad)?.descripcion || "",
        marca: marcas.find(m => m.id_marca === selectedMarca)?.aceite || "",
        aceites: raw.items.map(it => it.articulo.replace(/-\d+$/, "").trim()),
        filtros: {
          aceite: filtrosAceite.find((f) => f.id_marca === selectedFiltro)?.descripcion,
          aire: filtrosAire.find((f) => f.id_marca === selectedFiltroAire)?.descripcion,
          combustible: filtrosCombustible.find((f) => f.id_marca === selectedFiltroCombustible)?.descripcion,
          caja: filtrosCaja.find((f) => f.id_marca === selectedFiltroCaja)?.descripcion,
        },
        descuento: descuentoParam,
        items: raw.items.map((it) => ({
          id: it.id_articulo,
          nombre: it.articulo.replace(/-\d+$/, "").trim(),
          modelo: it.modelo,
          precioAceite: it.total_aceite,
          filtroAceite: it.filtro_aceite || undefined,
          filtroAire: it.filtro_aire || undefined,
          filtroCombustible: it.filtro_combustible || undefined,
          filtroCaja: it.filtro_caja || undefined,
          total: parseMonto(it.total),
          descuentoMonto: parseMonto(it.descuento),
          totalConDescuento: it.total_descuento,
          imagenUrl: `${BASE_URL}/articulosimg/${it.id_articulo}`,
        })),
      };

      setQuotationDataForModal(quotationDataWithItems);
      setShowQuotationModal(true);
    } catch (e) {
      let errorMsg = "No se pudo generar la cotización. Intentá nuevamente.";

      if (e instanceof TypeError && e.message === "Failed to fetch") {
        errorMsg = "No se pudo conectar con el servidor. Verificá tu conexión.";
      } else if (e instanceof Error) {
        const status = (e as Error & { status?: number }).status;
        if (e.name === "AbortError") {
          errorMsg = "La solicitud tardó demasiado. Intentá nuevamente.";
        } else if (status === 404) {
          // El endpoint de cotización no encontró resultado para esta combinación.
          errorMsg =
            "No encontramos una cotización para esa combinación. Revisá el modelo, la viscosidad, la marca y los filtros seleccionados.";
        } else if (status && status >= 500) {
          errorMsg = "El servidor tuvo un problema. Intentá de nuevo en unos minutos.";
        } else if (e.message === "Respuesta sin datos de cotización") {
          const nombres = aceites
            .filter((a) => selectedAceites.includes(a.id_articulo))
            .map((a) => a.articulo.replace(/-\d+$/, "").trim());
          const lista = nombres.length > 0 ? `:\n• ${nombres.join("\n• ")}` : "";
          errorMsg =
            `No se pudo cotizar alguno de los productos seleccionados${lista}.\n\n` +
            "Probá deseleccionando uno por uno para identificar cuál no tiene precio cargado, o elegí otro producto.";
        }
      }

      console.error("❌ ERROR OBTENIENDO COTIZACIÓN:", e);
      alert(errorMsg);
    } finally {
      setLoadingCotizacion(false);
    }
  };

  const handleSelect = (modelo: string) => {
    setSelected(modelo);
    setQuery(modelo);
    setOpen(false);
    fetchFiltrosAceite(modelo);
    fetchFiltrosAire(modelo);
    fetchFiltrosCombustible(modelo);
    fetchFiltrosCaja(modelo);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="pt-24 pb-8 px-4 bg-gradient-to-b from-card/40 to-transparent border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
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

          {/* Cantidad y Descuento */}
          {selected && selectedViscosidad && selectedMarca && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" /> Cantidad y Descuento
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Especificá cantidades y descuento
              </p>
              <div className="grid grid-cols-3 gap-4">
                {/* Litros */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">
                    Litros
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={cantidadLitros}
                    onChange={(e) => setCantidadLitros(e.target.value)}
                    className="w-full bg-card border-2 border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Galones */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">
                    Galones
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={cantidadGalones}
                    onChange={(e) => setCantidadGalones(e.target.value)}
                    className="w-full bg-card border-2 border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Descuento */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">
                    Descuento %
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="1"
                    min="0"
                    max="100"
                    value={descuento}
                    onChange={(e) => {
                      const n = e.target.value.replace(/\D/g, "");
                      if (n === "") return setDescuento("");
                      setDescuento(String(Math.min(100, parseInt(n, 10))));
                    }}
                    placeholder="0"
                    className="w-full bg-card border-2 border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
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
              <div className="flex items-center justify-between gap-2 mb-6">
                <p className="text-sm text-muted-foreground">
                  Seleccioná los productos que deseas cotizar
                </p>
                {!aceitesLoading &&
                  aceites.filter((a) => filtrarPorStock(a.id_articulo)).length > 0 && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAceites(
                            aceites
                              .filter((a) => filtrarPorStock(a.id_articulo))
                              .map((a) => a.id_articulo)
                          )
                        }
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Marcar todos
                      </button>
                      <span className="text-xs text-muted-foreground">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedAceites([])}
                        className="text-xs font-semibold text-muted-foreground hover:underline"
                      >
                        Desmarcar todos
                      </button>
                    </div>
                  )}
              </div>
              {aceitesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : aceites.filter((a) => filtrarPorStock(a.id_articulo)).length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay productos disponibles
                </div>
              ) : (
                <div className="space-y-2">
                  {aceites.filter((a) => filtrarPorStock(a.id_articulo)).map((aceite) => (
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

          {/* Marca del filtros */}
          {selected &&
            selectedAceites.length > 0 &&
            ((tipoServicio === "motor" &&
              (filtrosLoading ||
                filtrosAireLoading ||
                filtrosCombustibleLoading ||
                filtrosAceite.length > 0 ||
                filtrosAire.length > 0 ||
                filtrosCombustible.length > 0)) ||
              (tipoServicio === "caja" &&
                (filtrosCajaLoading || filtrosCaja.length > 0))) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" /> Marca del filtros
              </h2>

              {(() => {
                const grupos =
                  tipoServicio === "motor"
                    ? [
                        {
                          key: "aceite",
                          label: "Filtro de aceite",
                          icon: "🛢️",
                          loading: filtrosLoading,
                          items: filtrosAceite,
                          selected: selectedFiltro,
                          onSelect: setSelectedFiltro,
                        },
                        {
                          key: "aire",
                          label: "Filtro de aire",
                          icon: "💨",
                          loading: filtrosAireLoading,
                          items: filtrosAire,
                          selected: selectedFiltroAire,
                          onSelect: setSelectedFiltroAire,
                        },
                        {
                          key: "combustible",
                          label: "Filtro de combustible",
                          icon: "⛽",
                          loading: filtrosCombustibleLoading,
                          items: filtrosCombustible,
                          selected: selectedFiltroCombustible,
                          onSelect: setSelectedFiltroCombustible,
                        },
                      ]
                    : [
                        {
                          key: "caja",
                          label: "Filtro de caja",
                          icon: "⚙️",
                          loading: filtrosCajaLoading,
                          items: filtrosCaja,
                          selected: selectedFiltroCaja,
                          onSelect: setSelectedFiltroCaja,
                        },
                      ];

                const visibles = grupos.filter(
                  (g) => g.loading || g.items.length > 0
                );
                if (visibles.length === 0) return null;

                const colsClass =
                  visibles.length === 1
                    ? "grid-cols-1"
                    : visibles.length === 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

                return (
                  <div className={`grid ${colsClass} gap-4`}>
                    {visibles.map((g) => (
                      <div
                        key={g.key}
                        className="rounded-2xl border border-border bg-card/40 p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-base leading-none">
                            {g.icon}
                          </span>
                          <p className="text-sm font-semibold text-foreground/90">
                            {g.label}
                          </p>
                        </div>
                        {g.loading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {g.items.map((filtro) => {
                              const active = g.selected === filtro.id_marca;
                              return (
                                <button
                                  key={filtro.id_marca}
                                  type="button"
                                  onClick={() => g.onSelect(filtro.id_marca)}
                                  className={`relative w-full rounded-xl border-2 py-3 px-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                                    active
                                      ? "border-primary bg-primary/10 text-primary shadow-md"
                                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary/40 hover:text-foreground"
                                  }`}
                                >
                                  <span>{filtro.descripcion}</span>
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
                      </div>
                    ))}
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* Botón Generar Cotización */}
          {selected && selectedAceites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12"
            >
              <button
                onClick={fetchCotizacionAPI}
                disabled={loadingCotizacion}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg hover:shadow-lg hover:from-primary/90 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingCotizacion ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Calculator className="w-6 h-6" />
                    Generar Cotización
                  </>
                )}
              </button>
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
                  {selectedAceites.length > 0 &&
                    tipoServicio === "motor" &&
                    selectedFiltro && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Marca del filtro de aceite:{" "}
                        <span className="text-primary font-semibold">
                          {filtrosAceite.find(
                            (f) => f.id_marca === selectedFiltro
                          )?.descripcion}
                        </span>
                      </p>
                    )}
                  {selectedAceites.length > 0 &&
                    tipoServicio === "motor" &&
                    selectedFiltroAire && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Marca del filtro de aire:{" "}
                        <span className="text-primary font-semibold">
                          {filtrosAire.find(
                            (f) => f.id_marca === selectedFiltroAire
                          )?.descripcion}
                        </span>
                      </p>
                    )}
                  {selectedAceites.length > 0 &&
                    tipoServicio === "motor" &&
                    selectedFiltroCombustible && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Marca del filtro de combustible:{" "}
                        <span className="text-primary font-semibold">
                          {filtrosCombustible.find(
                            (f) => f.id_marca === selectedFiltroCombustible
                          )?.descripcion}
                        </span>
                      </p>
                    )}
                  {selectedAceites.length > 0 &&
                    tipoServicio === "caja" &&
                    selectedFiltroCaja && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Marca del filtro de caja:{" "}
                        <span className="text-primary font-semibold">
                          {filtrosCaja.find(
                            (f) => f.id_marca === selectedFiltroCaja
                          )?.descripcion}
                        </span>
                      </p>
                    )}
                  {selectedAceites.length > 0 && Number(descuento) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Descuento:{" "}
                      <span className="text-primary font-semibold">
                        {descuento}%
                      </span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {selected && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-secondary/40 transition"
              >
                <ChevronDown className="w-4 h-4 rotate-180" />
                Volver al inicio
              </button>
            </div>
          )}
        </motion.section>
      </main>

      {/* Modal de Cotización */}
      {(quotationDataForModal || quotationData) && (
        <QuotationModal
          isOpen={showQuotationModal}
          onClose={() => {
            setShowQuotationModal(false);
            setSelected(null);
            setQuery("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          data={quotationDataForModal || quotationData!}
          cantidadLitros={cantidadLitros || "4"}
          cantidadGalones={cantidadGalones || "1"}
          aceitesSeleccionados={aceites
            .filter((a) => selectedAceites.includes(a.id_articulo))
            .map((a) => ({
              id: a.id_articulo,
              nombre: a.articulo.replace(/-\d+$/, "").trim(),
              precioBruto: precioBrutoPorId.get(a.id_articulo) ?? null,
            }))}
          apiData={cotizacionAPI?.resultado ? { resultado: cotizacionAPI.resultado } : undefined}
        />
      )}
    </div>
  );
}
