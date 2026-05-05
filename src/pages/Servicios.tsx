import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Droplets,
  Filter,
  Settings,
  ShieldCheck,
  Gauge,
  Wrench,
  Calendar,
  Phone,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ClipboardCheck,
  Car,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const SERVICES = [
  {
    icon: Droplets,
    title: "Cambio de aceite",
    desc: "Cambio rápido y profesional con aceites mineral, semisintético o sintético según las recomendaciones del fabricante de tu vehículo.",
    includes: [
      "Drenaje completo del aceite usado",
      "Cambio de filtro de aceite",
      "Verificación de niveles",
      "Limpieza del cárter",
    ],
    priceFrom: "120.000",
    color: "amber",
  },
  {
    icon: Filter,
    title: "Cambio de filtros",
    desc: "Reemplazo de filtros de aire, combustible y habitáculo. Mantenimiento esencial para el rendimiento del motor y la calidad del aire.",
    includes: [
      "Filtro de aire del motor",
      "Filtro de combustible",
      "Filtro de habitáculo (polen)",
      "Filtro de aceite",
    ],
    priceFrom: "35.000",
    color: "sky",
  },
  {
    icon: Settings,
    title: "Mantenimiento preventivo",
    desc: "Plan integral según kilometraje y tipo de vehículo. Detectamos a tiempo problemas antes de que se vuelvan costosos.",
    includes: [
      "Revisión general del vehículo",
      "Cambio de aceite y filtros",
      "Verificación de líquidos",
      "Inspección visual de componentes",
    ],
    priceFrom: "200.000",
    color: "emerald",
  },
  {
    icon: Gauge,
    title: "Revisión técnica",
    desc: "Diagnóstico completo del estado de tu vehículo. Te entregamos un reporte detallado con recomendaciones.",
    includes: [
      "Revisión de frenos y suspensión",
      "Estado de neumáticos",
      "Sistema eléctrico básico",
      "Reporte escrito",
    ],
    priceFrom: "80.000",
    color: "purple",
  },
  {
    icon: Droplets,
    title: "Cambio de líquidos",
    desc: "Renovación de líquidos esenciales: frenos, refrigerante, dirección hidráulica y caja de cambios.",
    includes: [
      "Líquido de frenos",
      "Refrigerante / Anticongelante",
      "Líquido de dirección",
      "Aceite de caja",
    ],
    priceFrom: "50.000",
    color: "rose",
  },
  {
    icon: ShieldCheck,
    title: "Asesoría técnica",
    desc: "Te ayudamos a elegir los productos correctos para tu vehículo. Sin compromiso, con honestidad.",
    includes: [
      "Recomendación de aceite ideal",
      "Selección de filtros",
      "Consejos de mantenimiento",
      "Consulta sin costo",
    ],
    priceFrom: "0",
    color: "primary",
  },
];

const PROCESS = [
  {
    icon: Phone,
    step: "01",
    title: "Contactanos",
    desc: "Llamanos o escribinos por WhatsApp para coordinar el servicio que necesitás.",
  },
  {
    icon: Calendar,
    step: "02",
    title: "Agendá tu turno",
    desc: "Coordinamos día y hora que te resulte conveniente, sin esperas.",
  },
  {
    icon: ClipboardCheck,
    step: "03",
    title: "Diagnóstico",
    desc: "Revisamos tu vehículo y te explicamos lo que necesita, con presupuesto claro.",
  },
  {
    icon: Wrench,
    step: "04",
    title: "Servicio profesional",
    desc: "Realizamos el trabajo con productos de calidad y técnicos capacitados.",
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  amber: { bg: "bg-amber-400/10", text: "text-amber-400", border: "border-amber-400/30", ring: "ring-amber-400/20" },
  sky: { bg: "bg-sky-400/10", text: "text-sky-400", border: "border-sky-400/30", ring: "ring-sky-400/20" },
  emerald: { bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/30", ring: "ring-emerald-400/20" },
  purple: { bg: "bg-purple-400/10", text: "text-purple-400", border: "border-purple-400/30", ring: "ring-purple-400/20" },
  rose: { bg: "bg-rose-400/10", text: "text-rose-400", border: "border-rose-400/30", ring: "ring-rose-400/20" },
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30", ring: "ring-primary/20" },
};

export default function Servicios() {
  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO ===== */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,_hsl(36_90%_50%_/_0.1)_0%,_transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Nuestros servicios
          </motion.div>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-5xl md:text-6xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            CUIDAMOS TU VEHÍCULO
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Desde el cambio de aceite hasta el mantenimiento integral. Un servicio para cada necesidad, con la calidad que tu auto merece.
          </motion.p>
        </div>
      </section>

      {/* ===== SERVICES GRID ===== */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => {
              const c = colorClasses[service.color];
              return (
                <motion.div
                  key={service.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  className={`group bg-card border ${c.border} rounded-2xl p-6 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 flex flex-col`}
                >
                  <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <service.icon className={`w-6 h-6 ${c.text}`} />
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{service.desc}</p>

                  <div className="border-t border-border pt-4 mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Incluye:</p>
                    <ul className="space-y-1.5">
                      {service.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-foreground/80">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${c.text} shrink-0 mt-0.5`} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Desde</p>
                      <p className={`text-base font-bold ${c.text}`}>
                        {service.priceFrom === "0" ? "Gratis" : `Gs. ${service.priceFrom}`}
                      </p>
                    </div>
                    <Link
                      to="/cotizador"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      Cotizar
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="py-20 px-4 bg-card/40 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Cómo trabajamos</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              UN PROCESO SIMPLE Y CLARO
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Sin sorpresas, sin letras chicas. Te explicamos cada paso para que sepas exactamente qué se hace en tu vehículo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {PROCESS.map((p, i) => (
              <motion.div
                key={p.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="relative bg-background border border-border rounded-2xl p-6 hover:border-primary/40 transition-all"
              >
                <span
                  className="absolute top-4 right-4 text-4xl font-bold text-primary/15 leading-none"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {p.step}
                </span>
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-8 md:p-12"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  ¿NO SABÉS QUÉ SERVICIO NECESITÁS?
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Usá nuestro cotizador y te ayudamos a calcular el costo según tu vehículo y kilometraje.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  to="/cotizador"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 shadow-md shadow-primary/20"
                >
                  <Wrench className="w-4 h-4" />
                  Cotizar mantenimiento
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <a
                  href="https://wa.me/595974759037"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-all hover:scale-105"
                >
                  <svg viewBox="0 0 32 32" className="w-4 h-4" aria-hidden="true">
                    <path fill="#fff" d="M16.03 3C9.22 3 3.98 8.24 3.98 15.05c0 2.65.86 5.1 2.34 7.11L3 29l6.18-3.29c1.86 1.03 3.98 1.59 6.85 1.59 6.81 0 12.05-5.24 12.05-12.05S22.84 3 16.03 3zm6.87 18.22c-.26.73-1.49 1.39-2.07 1.47-.54.08-1.2.12-2.98-.44-2.57-.86-4.23-2.98-4.36-3.13-.13-.16-1.04-1.22-1.04-2.33 0-1.11.64-1.66.87-1.89.23-.23.5-.26.68-.26.17 0 .35 0 .5.01.16.01.38-.06.59.45.21.51.71 1.76.77 1.9.06.14.1.3.02.48-.08.18-.12.3-.24.46-.12.16-.26.36-.36.49-.12.16-.24.34-.1.57.14.23.62 1.02 1.33 1.65.92.82 1.69 1.2 2.01 1.34.32.14.51.12.7-.07.19-.19.83-.98 1.05-1.32.22-.34.43-.28.72-.17.29.11 1.83.86 2.14 1.01.31.15.52.23.6.36.08.13.08.76-.18 1.49z" />
                  </svg>
                  Consultanos
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
