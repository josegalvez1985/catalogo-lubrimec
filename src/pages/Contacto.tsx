import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  MapPin,
  Clock,
  Mail,
  Send,
  Sparkles,
  ChevronDown,
  Facebook,
  Instagram,
  MessageCircle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const CONTACT_METHODS = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+595 974 759 037",
    href: "https://wa.me/595974759037",
    desc: "Respuesta en pocos minutos",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
    external: true,
  },
  {
    icon: Phone,
    label: "Teléfono",
    value: "+595 974 759 037",
    href: "tel:+595974759037",
    desc: "Lun a Sáb en horario comercial",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/30",
    external: false,
  },
  {
    icon: MapPin,
    label: "Dirección",
    value: "Capiatá, Ruta 2 Km 20",
    href: "https://maps.app.goo.gl/yvJk2A8PbadJKpwQ7",
    desc: "Ver en Google Maps",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    external: true,
  },
];

const HOURS = [
  { day: "Lunes – Viernes", time: "7:00 – 18:00" },
  { day: "Sábado", time: "7:00 – 13:00" },
  { day: "Domingo", time: "Cerrado", closed: true },
];

const FAQ = [
  {
    q: "¿Necesito agendar turno?",
    a: "Recomendamos agendar para evitar esperas, pero también atendemos por orden de llegada. Podés escribirnos por WhatsApp para coordinar.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos efectivo, transferencia bancaria y tarjetas de débito/crédito. Consultá por opciones de financiación para servicios mayores.",
  },
  {
    q: "¿Trabajan con todas las marcas de vehículos?",
    a: "Sí, trabajamos con todas las marcas y modelos: autos, motos, pickups, 4x4, utilitarios y camiones livianos.",
  },
  {
    q: "¿Cuánto tarda un cambio de aceite?",
    a: "Aproximadamente 30 minutos. Si querés agregar más servicios (filtros, líquidos), el tiempo puede extenderse hasta 1 hora.",
  },
  {
    q: "¿Dan garantía por los trabajos?",
    a: "Sí, todos nuestros servicios cuentan con garantía. Te explicamos los términos al momento de coordinar el servicio.",
  },
  {
    q: "¿Puedo llevar mi propio aceite o filtro?",
    a: "Sí, podés llevar productos propios. Solo cobramos la mano de obra del servicio. Nos asesoramos sobre la calidad del producto antes.",
  },
];

export default function Contacto() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const buildWhatsAppMessage = () => {
    const lines = [
      `📩 *Consulta desde la web — Lubrimec*`,
      ``,
      name ? `👤 Nombre: ${name}` : "",
      phone ? `📞 Teléfono: ${phone}` : "",
      subject ? `📋 Asunto: ${subject}` : "",
      ``,
      `💬 Mensaje:`,
      message,
    ]
      .filter(Boolean)
      .join("\n");
    return encodeURIComponent(lines);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = `https://wa.me/595974759037?text=${buildWhatsAppMessage()}`;
    window.open(url, "_blank");
  };

  const isFormValid = message.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO ===== */}
      <section className="relative pt-28 pb-12 px-4 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,_hsl(36_90%_50%_/_0.1)_0%,_transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Hablemos
          </motion.div>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-5xl md:text-6xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            ESTAMOS PARA AYUDARTE
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Escribinos, llamanos o visitanos. Cualquier consulta sobre productos o servicios — te respondemos rápido.
          </motion.p>
        </div>
      </section>

      {/* ===== CONTACT METHODS ===== */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {CONTACT_METHODS.map((method, i) => (
            <motion.a
              key={method.label}
              href={method.href}
              target={method.external ? "_blank" : undefined}
              rel={method.external ? "noopener noreferrer" : undefined}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className={`group bg-card border ${method.border} rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 rounded-xl ${method.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <method.icon className={`w-6 h-6 ${method.color}`} />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{method.label}</p>
              <p className={`text-base font-bold ${method.color} mb-1`}>{method.value}</p>
              <p className="text-xs text-muted-foreground">{method.desc}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ===== FORM + INFO ===== */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              ENVIANOS UN MENSAJE
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Completá el formulario y te respondemos por WhatsApp.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Nombre
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Teléfono
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+595 ..."
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                  Asunto
                </label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
                >
                  <option value="">Seleccioná un asunto...</option>
                  <option value="Consulta de producto">Consulta de producto</option>
                  <option value="Cotización de servicio">Cotización de servicio</option>
                  <option value="Agendar turno">Agendar turno</option>
                  <option value="Garantía">Garantía / Reclamo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                  Mensaje <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Contanos en qué podemos ayudarte..."
                  rows={5}
                  className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-green-500/20"
              >
                <Send className="w-4 h-4" />
                Enviar por WhatsApp
              </button>

              <p className="text-xs text-center text-muted-foreground">
                Al enviar, se abrirá WhatsApp con tu mensaje. No almacenamos los datos del formulario.
              </p>
            </form>
          </motion.div>

          {/* Info sidebar */}
          <motion.aside
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            className="lg:col-span-2 space-y-6"
          >
            {/* Hours */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground">Horarios</h3>
              </div>
              <ul className="space-y-2.5">
                {HOURS.map((h) => (
                  <li key={h.day} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className={h.closed ? "text-destructive font-semibold" : "text-foreground font-semibold"}>
                      {h.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Email (extra contact) */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground">Correo</h3>
              </div>
              <a
                href="mailto:contacto@lubrimec.com.py"
                className="text-sm text-primary hover:underline break-all"
              >
                contacto@lubrimec.com.py
              </a>
            </div>

            {/* Social */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-base font-bold text-foreground mb-4">Seguinos</h3>
              <div className="flex gap-3">
                <a
                  href="https://wa.me/595974759037"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-all hover:scale-110"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all hover:scale-110"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-amber-400 text-white flex items-center justify-center transition-all hover:scale-110"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* ===== MAP ===== */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Ubicación</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              VENINOS A VISITAR
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden border border-border shadow-xl shadow-black/30"
          >
            <iframe
              title="Ubicación Lubrimec en Capiatá"
              src="https://maps.google.com/maps?q=Capiat%C3%A1%20Ruta%202%20Km%2020&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="420"
              style={{ border: 0, filter: "grayscale(20%) contrast(1.05)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </motion.div>

          <div className="mt-4 flex justify-center">
            <a
              href="https://maps.app.goo.gl/yvJk2A8PbadJKpwQ7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 shadow-md shadow-primary/20"
            >
              <MapPin className="w-4 h-4" />
              Cómo llegar
            </a>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 px-4 bg-card/40 border-y border-border">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Preguntas frecuentes</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              RESPUESTAS RÁPIDAS
            </h2>
          </motion.div>

          <div className="space-y-3">
            {FAQ.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <motion.div
                  key={item.q}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  className={`bg-background border rounded-xl overflow-hidden transition-colors ${
                    isOpen ? "border-primary/40" : "border-border"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-card/40 transition-colors"
                  >
                    <span className={`text-sm font-semibold ${isOpen ? "text-primary" : "text-foreground"}`}>
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
