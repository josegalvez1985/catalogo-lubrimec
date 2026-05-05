import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Heart,
  Award,
  Users,
  Wrench,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import lubrimecLogo from "@/assets/lubrimec-logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const VALUES = [
  {
    icon: Target,
    title: "Misión",
    desc: "Brindar productos y servicios de mantenimiento automotriz de alta calidad, con atención personalizada y precios justos para todos nuestros clientes en Capiatá y alrededores.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Eye,
    title: "Visión",
    desc: "Ser el lubricentro de referencia en Paraguay, reconocido por la excelencia técnica, el compromiso con el cliente y la innovación en el cuidado de cada vehículo.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    icon: Heart,
    title: "Valores",
    desc: "Honestidad, calidad, compromiso y trato cercano. Cuidamos cada vehículo como si fuera nuestro, porque entendemos que tu auto es parte importante de tu día a día.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
];

const REASONS = [
  "Más de 10 años de experiencia en el rubro",
  "Productos originales y de marcas reconocidas",
  "Atención personalizada y asesoría técnica",
  "Precios competitivos y transparentes",
  "Servicio express con turnos coordinados",
  "Garantía en todos nuestros trabajos",
];

const STATS = [
  { value: "10+", label: "Años de experiencia" },
  { value: "5K+", label: "Clientes satisfechos" },
  { value: "50+", label: "Marcas en stock" },
  { value: "100%", label: "Compromiso" },
];

export default function Nosotros() {
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
            Nosotros
          </motion.div>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-5xl md:text-6xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            CONOCÉ A LUBRIMEC
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Un lubricentro nacido en Capiatá con la pasión de cuidar cada vehículo como si fuera propio. Te contamos quiénes somos.
          </motion.p>
        </div>
      </section>

      {/* ===== HISTORY ===== */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Nuestra historia</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              MÁS DE UNA DÉCADA AL SERVICIO DE TU AUTO
            </h2>
            <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Lubrimec</strong> nació con un objetivo claro: ofrecer un servicio de lubricentro confiable, transparente y accesible para los conductores de Capiatá y zonas aledañas.
              </p>
              <p>
                Lo que comenzó como un pequeño taller familiar se convirtió en un punto de referencia gracias al compromiso con la calidad, el trato cercano y la atención técnica especializada.
              </p>
              <p>
                Hoy contamos con un catálogo completo de lubricantes, filtros, aceites y servicios de mantenimiento preventivo para autos, motos, pickups y camiones — siempre con productos originales y la garantía que nos caracteriza.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            className="relative"
          >
            <div className="aspect-square max-w-sm mx-auto relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-2xl" />
              <div className="relative h-full rounded-3xl bg-card border border-border flex items-center justify-center p-12">
                <img src={lubrimecLogo} alt="Lubrimec" className="w-full h-full object-contain" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-12 px-4 bg-card/40 border-y border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="text-center"
            >
              <p className="text-4xl md:text-5xl font-bold text-primary mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {stat.value}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== MISSION / VISION / VALUES ===== */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Lo que nos define</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              MISIÓN, VISIÓN Y VALORES
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((value, i) => (
              <motion.div
                key={value.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${value.bg} flex items-center justify-center mb-4`}>
                  <value.icon className={`w-6 h-6 ${value.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {value.title.toUpperCase()}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 px-4 bg-card/30 border-y border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <Award className="w-3.5 h-3.5" />
              ¿Por qué elegirnos?
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              LA CONFIANZA SE GANA TRABAJANDO BIEN
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Cada cliente es una historia y cada vehículo, una responsabilidad. Por eso nos enfocamos en hacer las cosas como deben hacerse.
            </p>
            <Link
              to="/cotizador"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 shadow-md shadow-primary/20"
            >
              <Wrench className="w-4 h-4" />
              Cotizá tu mantenimiento
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.ul
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            className="space-y-3"
          >
            {REASONS.map((reason) => (
              <li key={reason} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-background border border-border">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{reason}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ===== TEAM ===== */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
              <Users className="w-3.5 h-3.5" />
              Nuestro equipo
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              GENTE QUE LE PONE EL ALMA
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Un equipo capacitado, con experiencia técnica y la actitud de servicio que nos diferencia.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { name: "Equipo Técnico", role: "Mecánicos especialistas", emoji: "🔧" },
              { name: "Atención al Cliente", role: "Asesores comerciales", emoji: "🤝" },
              { name: "Logística", role: "Stock y abastecimiento", emoji: "📦" },
            ].map((member, i) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/30 transition-all"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-4xl">
                  {member.emoji}
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              ¿LISTO PARA CUIDAR TU AUTO?
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-lg mx-auto">
              Visitá nuestro catálogo o cotizá tu mantenimiento. Estamos para ayudarte.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/catalogo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105"
              >
                Ver catálogo
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary border border-border text-foreground font-semibold text-sm hover:bg-secondary/80 hover:border-primary/40 transition-all hover:scale-105"
              >
                Contactanos
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
