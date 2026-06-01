import { Link } from "react-router-dom";
import { Phone, MapPin, Clock, BookOpen, Wrench, Home, Users, Settings, MessageSquare } from "lucide-react";
import lubrimecLogo from "@/assets/lubrimec-logo.png";

const navLinks = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Nosotros", href: "/nosotros", icon: Users },
  { label: "Servicios", href: "/servicios", icon: Settings },
  { label: "Catálogo", href: "/catalogo", icon: BookOpen },
  { label: "Cotizador", href: "/cotizador", icon: Wrench },
  { label: "Contacto", href: "/contacto", icon: MessageSquare },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img src={lubrimecLogo} alt="Lubrimec" className="w-10 h-10 object-contain" />
              <span
                className="text-2xl font-bold tracking-widest text-foreground"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                LUBRIMEC
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu lubricentro de confianza en Capiatá. Lubricantes, filtros, aceites y servicio de mantenimiento para tu vehículo.
            </p>
            <a
              href="https://wa.me/595974759037"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors shadow-md"
            >
              <svg viewBox="0 0 32 32" className="w-4 h-4" aria-hidden="true">
                <path fill="#fff" d="M16.03 3C9.22 3 3.98 8.24 3.98 15.05c0 2.65.86 5.1 2.34 7.11L3 29l6.18-3.29c1.86 1.03 3.98 1.59 6.85 1.59 6.81 0 12.05-5.24 12.05-12.05S22.84 3 16.03 3zm6.87 18.22c-.26.73-1.49 1.39-2.07 1.47-.54.08-1.2.12-2.98-.44-2.57-.86-4.23-2.98-4.36-3.13-.13-.16-1.04-1.22-1.04-2.33 0-1.11.64-1.66.87-1.89.23-.23.5-.26.68-.26.17 0 .35 0 .5.01.16.01.38-.06.59.45.21.51.71 1.76.77 1.9.06.14.1.3.02.48-.08.18-.12.3-.24.46-.12.16-.26.36-.36.49-.12.16-.24.34-.1.57.14.23.62 1.02 1.33 1.65.92.82 1.69 1.2 2.01 1.34.32.14.51.12.7-.07.19-.19.83-.98 1.05-1.32.22-.34.43-.28.72-.17.29.11 1.83.86 2.14 1.01.31.15.52.23.6.36.08.13.08.76-.18 1.49z" />
              </svg>
              Chateá con nosotros
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Navegación</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <link.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <a href="tel:+595974759037" className="hover:text-foreground transition-colors">
                  +595 974 759 037
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <div>
                  <p>Capiatá, Ruta 2 Km 20</p>
                  <a
                    href="https://maps.app.goo.gl/yvJk2A8PbadJKpwQ7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Ver en Google Maps →
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <div>
                  <p>Lun – Vie: 7:00 – 18:00</p>
                  <p>Sáb: 7:00 – 13:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Lubrimec. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Capiatá, Paraguay
          </p>
        </div>
      </div>
    </footer>
  );
}
