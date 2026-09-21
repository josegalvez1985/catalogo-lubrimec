import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Articulo } from "@/hooks/useArticulos";

/**
 * Lista de pedido mayorista.
 *
 * Deliberadamente separada del carrito minorista (`useCart`): son dos
 * intenciones distintas (una compra puntual vs. armar un pedido de reposición)
 * y mezclarlas haría que vaciar una borre la otra. Por eso usa su propia clave
 * de localStorage y no limita la cantidad al stock: el mayorista pide por
 * volumen y el stock del momento es sólo una referencia.
 */

export interface ItemMayorista {
  id_articulo: number;
  descripcion_articulo: string;
  descripcion_marca?: string | null;
  descripcion_rubro?: string | null;
  tiene_imagen?: number;
  /** Precio unitario ya con el descuento mayorista aplicado. */
  precio: number | null;
  /** Precio de lista sin descuento, para mostrar el ahorro. */
  precioLista: number | null;
  stock?: number | null;
  cantidad: number;
}

interface ListaMayoristaContextValue {
  items: ItemMayorista[];
  /** Cantidad de artículos distintos (líneas del pedido). */
  totalLineas: number;
  /** Suma de unidades pedidas. */
  totalUnidades: number;
  totalPrecio: number;
  /** Total sin descuento, para mostrar cuánto ahorra. */
  totalLista: number;
  cliente: string;
  setCliente: (nombre: string) => void;
  addItem: (articulo: Articulo, cantidad?: number) => void;
  removeItem: (id_articulo: number) => void;
  setCantidad: (id_articulo: number, cantidad: number) => void;
  clear: () => void;
  restore: (items: ItemMayorista[]) => void;
  getCantidad: (id_articulo: number) => number;
}

const STORAGE_KEY = "lubrimec_lista_mayorista";
const CLIENTE_KEY = "lubrimec_mayorista_cliente";

const ListaMayoristaContext = createContext<ListaMayoristaContextValue | null>(null);

function loadLista(): ItemMayorista[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadCliente(): string {
  try {
    return localStorage.getItem(CLIENTE_KEY) || "";
  } catch {
    return "";
  }
}

export function ListaMayoristaProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemMayorista[]>(loadLista);
  const [cliente, setCliente] = useState<string>(loadCliente);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(CLIENTE_KEY, cliente);
    } catch {
      /* ignore quota errors */
    }
  }, [cliente]);

  const addItem = (articulo: Articulo, cantidad = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id_articulo === articulo.id_articulo);
      if (existing) {
        return prev.map((i) =>
          i.id_articulo === articulo.id_articulo
            ? {
                ...i,
                // Refrescar precio y stock con lo último que devolvió la API:
                // la lista puede haber quedado guardada de una sesión anterior.
                precio: articulo.precio ?? i.precio,
                precioLista: articulo.precioLista ?? i.precioLista,
                stock: articulo.stock ?? i.stock,
                cantidad: i.cantidad + cantidad,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          id_articulo: articulo.id_articulo,
          descripcion_articulo: articulo.descripcion_articulo,
          descripcion_marca: articulo.descripcion_marca ?? null,
          descripcion_rubro: articulo.descripcion_rubro ?? null,
          tiene_imagen: articulo.tiene_imagen,
          precio: articulo.precio ?? null,
          precioLista: articulo.precioLista ?? null,
          stock: articulo.stock ?? null,
          cantidad,
        },
      ];
    });
  };

  const removeItem = (id_articulo: number) => {
    setItems((prev) => prev.filter((i) => i.id_articulo !== id_articulo));
  };

  const setCantidad = (id_articulo: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(id_articulo);
      return;
    }
    // Tope defensivo: un cero de más al tipear no debería generar un pedido absurdo.
    const cant = Math.min(Math.floor(cantidad), 9999);
    setItems((prev) =>
      prev.map((i) => (i.id_articulo === id_articulo ? { ...i, cantidad: cant } : i))
    );
  };

  const clear = () => setItems([]);
  const restore = (saved: ItemMayorista[]) => setItems(saved);

  const totalUnidades = useMemo(() => items.reduce((s, i) => s + i.cantidad, 0), [items]);
  const totalPrecio = useMemo(
    () => items.reduce((s, i) => s + (i.precio ?? 0) * i.cantidad, 0),
    [items]
  );
  const totalLista = useMemo(
    () => items.reduce((s, i) => s + (i.precioLista ?? i.precio ?? 0) * i.cantidad, 0),
    [items]
  );

  const value: ListaMayoristaContextValue = {
    items,
    totalLineas: items.length,
    totalUnidades,
    totalPrecio,
    totalLista,
    cliente,
    setCliente,
    addItem,
    removeItem,
    setCantidad,
    clear,
    restore,
    getCantidad: (id) => items.find((i) => i.id_articulo === id)?.cantidad ?? 0,
  };

  return (
    <ListaMayoristaContext.Provider value={value}>{children}</ListaMayoristaContext.Provider>
  );
}

export function useListaMayorista() {
  const ctx = useContext(ListaMayoristaContext);
  if (!ctx) throw new Error("useListaMayorista debe usarse dentro de <ListaMayoristaProvider>");
  return ctx;
}
