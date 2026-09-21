import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ListaMayoristaProvider } from "@/hooks/useListaMayorista";
import Mayorista from "@/pages/Mayorista";

// Los hooks de datos pegan a la API de APEX: acá sólo nos interesa que el
// armado del pedido funcione, así que los reemplazamos por datos fijos.
vi.mock("@/hooks/useArticulos", () => ({
  useArticulos: () => ({
    articulos: [
      {
        id_articulo: 1,
        descripcion_articulo: "Aceite 15W40 Balde 20L",
        descripcion_marca: "Shell",
        descripcion_rubro: "Aceites",
        id_rubro: 10,
        id_marca: 100,
        tiene_imagen: 0,
        stock: 8,
        precio: 500000,
      },
      {
        id_articulo: 2,
        descripcion_articulo: "Filtro de aceite W712",
        descripcion_marca: "Mann",
        descripcion_rubro: "Filtros",
        id_rubro: 20,
        id_marca: 200,
        tiene_imagen: 0,
        stock: 40,
        precio: 100000,
      },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock("@/hooks/useRubros", () => ({
  useRubros: () => ({
    rubros: [
      { id_rubro: 10, descripcion_rubro: "Aceites" },
      { id_rubro: 20, descripcion_rubro: "Filtros" },
    ],
    loading: false,
    error: null,
  }),
}));

vi.mock("@/hooks/useMarcas", () => ({
  useMarcas: () => ({
    marcas: [
      { id_marca: 100, descripcion_marca: "Shell", valoracion: 5 },
      { id_marca: 200, descripcion_marca: "Mann", valoracion: 4 },
    ],
    loading: false,
    error: null,
  }),
}));

/** El panel lateral "Mi pedido". En jsdom no hay CSS, así que las variantes de
 *  móvil y escritorio conviven en el DOM y hay que acotar las consultas. */
const panel = () => screen.getByRole("complementary", { name: "Mi pedido" });

function renderPagina() {
  return render(
    <MemoryRouter>
      <ListaMayoristaProvider>
        <Mayorista />
      </ListaMayoristaProvider>
    </MemoryRouter>
  );
}

/** Agrega un artículo tocando su fila, como hace el cliente. */
function elegir(nombre: string) {
  fireEvent.click(screen.getByText(nombre));
}

/** Escribe una cantidad en el primer campo (el de la fila del listado). */
function escribirCantidad(valor: string) {
  const campo = screen.getAllByLabelText("Cantidad")[0];
  fireEvent.change(campo, { target: { value: valor } });
  fireEvent.blur(campo);
}

describe("Pedido mayorista", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("aplica el 40% de descuento sobre el precio de lista", () => {
    renderPagina();
    // 500.000 de lista -> 300.000 con el 40% mayorista
    expect(screen.getAllByText("Gs. 300.000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Gs. 500.000").length).toBeGreaterThan(0);
  });

  it("arma el pedido al elegir productos y calcula el total", () => {
    renderPagina();

    elegir("Aceite 15W40 Balde 20L");
    elegir("Filtro de aceite W712");

    // 300.000 + 60.000 = 360.000
    expect(within(panel()).getByText("Gs. 360.000")).toBeInTheDocument();
    expect(within(panel()).getByText(/2 productos/)).toBeInTheDocument();
  });

  it("deja escribir la cantidad en vez de sumar de a uno", () => {
    renderPagina();

    elegir("Filtro de aceite W712");
    escribirCantidad("24");

    // 60.000 x 24 = 1.440.000, tanto en el subtotal de la línea como en el total
    expect(within(panel()).getAllByText("Gs. 1.440.000")).toHaveLength(2);
  });

  it("avisa cuando la cantidad pedida supera el stock", () => {
    renderPagina();

    elegir("Aceite 15W40 Balde 20L");
    escribirCantidad("50");

    expect(screen.getByText(/Pedís más que el stock actual \(8\)/)).toBeInTheDocument();
  });

  it("quita el artículo del pedido al bajar la cantidad a cero", () => {
    renderPagina();

    elegir("Filtro de aceite W712");
    expect(within(panel()).getByText(/1 producto/)).toBeInTheDocument();

    escribirCantidad("0");
    expect(within(panel()).getByText("Tu pedido está vacío")).toBeInTheDocument();
  });

  it("muestra el documento del pedido con el detalle y el total", async () => {
    renderPagina();

    elegir("Aceite 15W40 Balde 20L");
    fireEvent.click(screen.getAllByRole("button", { name: /Ver mi pedido/ })[0]);

    expect(await screen.findByText("Tu pedido mayorista")).toBeInTheDocument();
    expect(screen.getByText(/Descuento mayorista 40%/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Enviar/ })).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me")
    );
  });

  it("guarda el pedido para la próxima visita", () => {
    const { unmount } = renderPagina();

    elegir("Filtro de aceite W712");
    expect(within(panel()).getByText(/1 producto/)).toBeInTheDocument();
    act(() => unmount());

    renderPagina();
    expect(within(panel()).getByText("Filtro de aceite W712")).toBeInTheDocument();
  });

  it("filtra por rubro", () => {
    renderPagina();

    fireEvent.click(screen.getByRole("button", { name: "Filtros" }));

    expect(screen.queryByText("Aceite 15W40 Balde 20L")).not.toBeInTheDocument();
    expect(screen.getByText("Filtro de aceite W712")).toBeInTheDocument();
  });

  it("no ofrece marcas que no existen en el rubro elegido", () => {
    renderPagina();

    fireEvent.click(screen.getByRole("button", { name: "Aceites" }));
    const select = screen.getByLabelText("Filtrar por marca");
    expect(within(select).getByRole("option", { name: "Shell" })).toBeInTheDocument();
    expect(within(select).queryByRole("option", { name: "Mann" })).not.toBeInTheDocument();
  });
});
