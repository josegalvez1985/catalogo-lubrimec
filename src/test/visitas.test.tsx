import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Footer from "@/components/Footer";
import { VISITA_SESSION_KEY } from "@/hooks/useVisitas";

function renderFooter() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockFetch(body: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("Contador de visitas del footer", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("registra la visita con POST la primera vez y muestra el total", async () => {
    const fetchMock = mockFetch({ total: 1866 });
    renderFooter();

    expect(await screen.findByText("1.866")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("/paginaweb/visitas?cod_empresa=24");
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(sessionStorage.getItem(VISITA_SESSION_KEY)).toBe("1");
  });

  it("en la misma sesión sólo lee el contador con GET", async () => {
    sessionStorage.setItem(VISITA_SESSION_KEY, "1");
    const fetchMock = mockFetch({ total: 1865 });
    renderFooter();

    expect(await screen.findByText("1.865")).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][1].method).toBe("GET");
  });

  it("si la API falla no muestra el contador ni marca la visita", async () => {
    const fetchMock = mockFetch({}, false);
    renderFooter();

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByText(/visitas/)).not.toBeInTheDocument();
    expect(sessionStorage.getItem(VISITA_SESSION_KEY)).toBeNull();
  });
});
