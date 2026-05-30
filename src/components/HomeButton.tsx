import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";

// Botón flotante fijo para volver al inicio desde cualquier página.
// Se oculta cuando ya estamos en la home ("/").
export default function HomeButton() {
  const { pathname } = useLocation();
  if (pathname === "/") return null;

  return (
    <Link
      to="/"
      aria-label="Volver al inicio"
      title="Inicio"
      className="fixed bottom-5 left-5 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/20 hover:bg-primary/90 hover:scale-105 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <Home className="w-5 h-5" />
    </Link>
  );
}
