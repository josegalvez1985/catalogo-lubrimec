import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Wrench,
  ShieldCheck,
  Zap,
  MapPin,
  Phone,
  ChevronRight,
  Star,
  Droplets,
  Filter,
  Settings,
} from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import lubrimecLogo from "@/assets/lubrimec-logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const SERVICES = [
  {
    icon: Droplets,
    title: "Cambio de aceite",
    desc: "Servicio express de cambio de aceite con productos de primera calidad para todos los vehículos.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Filter,
    title: "Cambio de filtros",
    desc: "Filtros de aceite, aire y combustible originales. Revisión completa del sistema de filtrado.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    icon: Settings,
    title: "Mantenimiento preventivo",
    desc: "Planes de mantenimiento personalizados según el tipo y kilometraje de tu vehículo.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: ShieldCheck,
    title: "Garantía de calidad",
    desc: "Todos nuestros trabajos cuentan con garantía. Usamos solo productos certificados.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

const FEATURES = [
  { icon: Zap, label: "Servicio rápido", sub: "Express en 30 min" },
  { icon: Star, label: "Productos premium", sub: "Marcas reconocidas" },
  { icon: MapPin, label: "Ubicación estratégica", sub: "Ruta 2 Km 20, Capiatá" },
  { icon: Phone, label: "Atención personalizada", sub: "WhatsApp disponible" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <img
          src={heroBanner}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_hsl(36_90%_50%_/_0.08)_0%,_transparent_70%)]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Logo badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="flex justify-center mb-8"
          >
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute h-28 w-28 rounded-[28px] bg-white/95 shadow-2xl shadow-black/30" />
              <img
                src={lubrimecLogo}
                alt="Lubrimec"
                className="relative z-10 w-24 h-24 object-contain"
              />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-6xl sm:text-7xl md:text-8xl font-bold text-foreground tracking-wider mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            LUBRIMEC
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide mb-3"
          >
            Tu lubricentro de confianza en Capiatá
          </motion.p>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="text-base text-muted-foreground/70 max-w-xl mx-auto mb-10"
          >
            Lubricantes, filtros, aceites y mantenimiento preventivo para autos, motos y camiones. Productos premium, servicio express.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-xl shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/35 hover:scale-105 transition-all duration-200"
            >
              <BookOpen className="w-5 h-5" />
              Ver catálogo
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/cotizador"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-secondary/80 border border-border text-foreground font-bold text-base hover:bg-secondary hover:border-primary/30 hover:scale-105 transition-all duration-200"
            >
              <Wrench className="w-5 h-5" />
              Cotizá tu mantenimiento
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
          aria-hidden="true"
        >
          <span className="text-xs text-muted-foreground/50 tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className="w-0.5 h-6 rounded-full bg-gradient-to-b from-primary/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* ===== FEATURES BAR ===== */}
      <section className="bg-card/60 border-y border-border py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Nuestros servicios</p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              TODO LO QUE TU AUTO NECESITA
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
              Desde el cambio de aceite hasta planes de mantenimiento completos. Confía en los expertos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Catalog CTA */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-8 flex flex-col justify-between min-h-[260px]"
            >
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  CATÁLOGO DE PRODUCTOS
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Explorá nuestra amplia variedad de lubricantes, filtros, aceites y más. Filtrá por marca, viscosidad y categoría.
                </p>
              </div>
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 self-start"
              >
                Explorar catálogo
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Quoter CTA */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/20 p-8 flex flex-col justify-between min-h-[260px]"
            >
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Wrench className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  COTIZADOR DE MANTENIMIENTO
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Calculá el costo del mantenimiento para tu vehículo según el tipo, año y kilometraje. Recibí tu cotización por WhatsApp.
                </p>
              </div>
              <Link
                to="/cotizador"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-all hover:scale-105 self-start"
              >
                Cotizá ahora
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== LOCATION ===== */}
      <section className="py-16 px-4 bg-card/30 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">¿Dónde estamos?</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                ENCONTRANOS EN CAPIATÁ
              </h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  Ruta 2 Km 20, Capiatá, Paraguay
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  +595 974 759 037
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://maps.app.goo.gl/yvJk2A8PbadJKpwQ7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105"
              >
                <MapPin className="w-4 h-4" />
                Ver en Google Maps
              </a>
              <a
                href="https://wa.me/595974759037"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-all hover:scale-105"
              >
                <svg viewBox="0 0 32 32" className="w-4 h-4" aria-hidden="true">
                  <path fill="#fff" d="M16.03 3C9.22 3 3.98 8.24 3.98 15.05c0 2.65.86 5.1 2.34 7.11L3 29l6.18-3.29c1.86 1.03 3.98 1.59 6.85 1.59 6.81 0 12.05-5.24 12.05-12.05S22.84 3 16.03 3zm6.87 18.22c-.26.73-1.49 1.39-2.07 1.47-.54.08-1.2.12-2.98-.44-2.57-.86-4.23-2.98-4.36-3.13-.13-.16-1.04-1.22-1.04-2.33 0-1.11.64-1.66.87-1.89.23-.23.5-.26.68-.26.17 0 .35 0 .5.01.16.01.38-.06.59.45.21.51.71 1.76.77 1.9.06.14.1.3.02.48-.08.18-.12.3-.24.46-.12.16-.26.36-.36.49-.12.16-.24.34-.1.57.14.23.62 1.02 1.33 1.65.92.82 1.69 1.2 2.01 1.34.32.14.51.12.7-.07.19-.19.83-.98 1.05-1.32.22-.34.43-.28.72-.17.29.11 1.83.86 2.14 1.01.31.15.52.23.6.36.08.13.08.76-.18 1.49z" />
                </svg>
                Escribinos
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
