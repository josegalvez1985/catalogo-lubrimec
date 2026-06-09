import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Articulo } from "@/hooks/useArticulos";

export interface CartItem {
  id_articulo: number;
  descripcion_articulo: string;
  descripcion_marca?: string | null;
  tiene_imagen?: number;
  precio: number | null;
  cantidad: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrecio: number;
  addItem: (articulo: Articulo, cantidad?: number) => void;
  removeItem: (id_articulo: number) => void;
  setCantidad: (id_articulo: number, cantidad: number) => void;
  clear: () => void;
  isInCart: (id_articulo: number) => boolean;
}

const STORAGE_KEY = "lubrimec_cart";

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items]);

  const addItem = (articulo: Articulo, cantidad = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id_articulo === articulo.id_articulo);
      if (existing) {
        return prev.map((i) =>
          i.id_articulo === articulo.id_articulo
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }
      return [
        ...prev,
        {
          id_articulo: articulo.id_articulo,
          descripcion_articulo: articulo.descripcion_articulo,
          descripcion_marca: articulo.descripcion_marca ?? null,
          tiene_imagen: articulo.tiene_imagen,
          precio: articulo.precio ?? null,
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
    setItems((prev) =>
      prev.map((i) => (i.id_articulo === id_articulo ? { ...i, cantidad } : i))
    );
  };

  const clear = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.cantidad, 0), [items]);
  const totalPrecio = useMemo(
    () => items.reduce((s, i) => s + (i.precio ?? 0) * i.cantidad, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    totalItems,
    totalPrecio,
    addItem,
    removeItem,
    setCantidad,
    clear,
    isInCart: (id) => items.some((i) => i.id_articulo === id),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
