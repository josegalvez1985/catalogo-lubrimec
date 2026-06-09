import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeButton from "@/components/HomeButton";
import heroBanner from "@/assets/hero-banner.jpg";
import Home from "./pages/Home";
import Nosotros from "./pages/Nosotros";
import Servicios from "./pages/Servicios";
import Catalogo from "./pages/Catalogo";
import Cotizador from "./pages/Cotizador";
import Contacto from "./pages/Contacto";
import Carrito from "./pages/Carrito";
import NotFound from "./pages/NotFound";
import { CartProvider } from "@/hooks/useCart";

// Sin caché: cada montaje/navegación re-consulta los endpoints en fresco.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // los datos se consideran obsoletos al instante
      gcTime: 0, // no retener nada en memoria al desmontar
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function Layout() {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Fondo global con el mismo efecto del hero del Home (fijo en todas las páginas) */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <img
          src={heroBanner}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-95 dark:opacity-100"
        />
        {/* Tinte: claro en tema claro, oscuro en tema oscuro */}
        <div className="absolute inset-0 bg-background/40 dark:bg-black/40" />
        {/* Degradado hacia el fondo de la página */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
        {/* Glow radial ámbar */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_hsl(36_90%_50%_/_0.10)_0%,_transparent_70%)]" />
      </div>
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/cotizador" element={<Cotizador />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      <HomeButton />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <CartProvider>
          <Layout />
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
