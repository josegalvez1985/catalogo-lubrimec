import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Wrench, BookOpen, Home, Users, Settings, MessageSquare } from "lucide-react";
import lubrimecLogo from "@/assets/lubrimec-logo.png";
import PwaInstallButton from "@/components/PwaInstallButton";

const navLinks = [
  {
    label: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    label: "Nosotros",
    href: "/nosotros",
    icon: Users,
    description: "Historia, misión y equipo",
  },
  {
    label: "Servicios",
    href: "/servicios",
    icon: Settings,
    description: "Mantenimiento, cambio de aceite y más",
  },
  {
    label: "Catálogo",
    href: "/catalogo",
    icon: BookOpen,
    description: "Lubricantes, filtros, aceites y más",
  },
  {
    label: "Cotizador",
    href: "/cotizador",
    icon: Wrench,
    description: "Cotizá el mantenimiento de tu auto",
  },
  {
    label: "Contacto",
    href: "/contacto",
    icon: MessageSquare,
    description: "Escribinos, llamanos o visitanos",
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-lg"
              aria-label="Ir al inicio — Lubrimec"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-200" />
                <img
                  src={lubrimecLogo}
                  alt=""
                  aria-hidden="true"
                  className="w-9 h-9 object-contain relative z-10"
                />
              </div>
              <span
                className="text-xl font-bold tracking-widest text-foreground"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                LUBRIMEC
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Navegación principal">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {active && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="https://wa.me/595974759037"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-all shadow-md shadow-green-500/20 hover:shadow-green-500/30 hover:scale-105"
              >
                <svg viewBox="0 0 32 32" className="w-4 h-4" aria-hidden="true">
                  <path fill="#fff" d="M16.03 3C9.22 3 3.98 8.24 3.98 15.05c0 2.65.86 5.1 2.34 7.11L3 29l6.18-3.29c1.86 1.03 3.98 1.59 6.85 1.59 6.81 0 12.05-5.24 12.05-12.05S22.84 3 16.03 3zm6.87 18.22c-.26.73-1.49 1.39-2.07 1.47-.54.08-1.2.12-2.98-.44-2.57-.86-4.23-2.98-4.36-3.13-.13-.16-1.04-1.22-1.04-2.33 0-1.11.64-1.66.87-1.89.23-.23.5-.26.68-.26.17 0 .35 0 .5.01.16.01.38-.06.59.45.21.51.71 1.76.77 1.9.06.14.1.3.02.48-.08.18-.12.3-.24.46-.12.16-.26.36-.36.49-.12.16-.24.34-.1.57.14.23.62 1.02 1.33 1.65.92.82 1.69 1.2 2.01 1.34.32.14.51.12.7-.07.19-.19.83-.98 1.05-1.32.22-.34.43-.28.72-.17.29.11 1.83.86 2.14 1.01.31.15.52.23.6.36.08.13.08.76-.18 1.49z" />
                </svg>
                WhatsApp
              </a>
              <PwaInstallButton compact />
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-border text-foreground hover:bg-secondary/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-background border-l border-border lg:hidden flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <img src={lubrimecLogo} alt="" aria-hidden="true" className="w-8 h-8 object-contain" />
                  <span className="font-bold tracking-widest text-foreground" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    LUBRIMEC
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar menú"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1" aria-label="Menú móvil">
                {navLinks.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link
                        to={link.href}
                        className={`flex items-start gap-3 px-4 py-3.5 rounded-xl transition-all ${
                          active
                            ? "bg-primary/10 border border-primary/20 text-primary"
                            : "text-foreground hover:bg-secondary/50 border border-transparent"
                        }`}
                      >
                        <link.icon className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">{link.label}</p>
                          {link.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Mobile footer actions */}
              <div className="px-4 py-5 border-t border-border space-y-3">
                <a
                  href="https://wa.me/595974759037"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors"
                >
                  <svg viewBox="0 0 32 32" className="w-5 h-5" aria-hidden="true">
                    <path fill="#fff" d="M16.03 3C9.22 3 3.98 8.24 3.98 15.05c0 2.65.86 5.1 2.34 7.11L3 29l6.18-3.29c1.86 1.03 3.98 1.59 6.85 1.59 6.81 0 12.05-5.24 12.05-12.05S22.84 3 16.03 3zm6.87 18.22c-.26.73-1.49 1.39-2.07 1.47-.54.08-1.2.12-2.98-.44-2.57-.86-4.23-2.98-4.36-3.13-.13-.16-1.04-1.22-1.04-2.33 0-1.11.64-1.66.87-1.89.23-.23.5-.26.68-.26.17 0 .35 0 .5.01.16.01.38-.06.59.45.21.51.71 1.76.77 1.9.06.14.1.3.02.48-.08.18-.12.3-.24.46-.12.16-.26.36-.36.49-.12.16-.24.34-.1.57.14.23.62 1.02 1.33 1.65.92.82 1.69 1.2 2.01 1.34.32.14.51.12.7-.07.19-.19.83-.98 1.05-1.32.22-.34.43-.28.72-.17.29.11 1.83.86 2.14 1.01.31.15.52.23.6.36.08.13.08.76-.18 1.49z" />
                  </svg>
                  Chateá por WhatsApp
                </a>
                <a
                  href="tel:+595974759037"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-secondary/50 hover:bg-secondary text-foreground font-medium text-sm transition-colors border border-border"
                >
                  <Phone className="w-4 h-4" />
                  +595 974 759 037
                </a>
                <div className="flex justify-center">
                  <PwaInstallButton compact />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
