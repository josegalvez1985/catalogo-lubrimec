import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Car,
  Gauge,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Info,
  Send,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

// ─── Data ────────────────────────────────────────────────────────────────────

const VEHICLE_TYPES = [
  { id: "auto", label: "Auto / SUV", icon: "🚗" },
  { id: "pickup", label: "Pickup / 4x4", icon: "🛻" },
  { id: "moto", label: "Moto", icon: "🏍️" },
  { id: "camion", label: "Camión / Utilitario", icon: "🚚" },
];

const ENGINES = [
  { id: "1.0-1.4", label: "1.0 – 1.4 L", multiplier: 1 },
  { id: "1.5-2.0", label: "1.5 – 2.0 L", multiplier: 1.2 },
  { id: "2.1-3.0", label: "2.1 – 3.0 L", multiplier: 1.45 },
  { id: "3.0+", label: "3.0 L o más", multiplier: 1.8 },
  { id: "moto", label: "Monocilíndrico / Bicilíndrico", multiplier: 0.6 },
];

const KM_RANGES = [
  { id: "5000", label: "Hasta 5.000 km", interval: "5.000 km" },
  { id: "10000", label: "5.001 – 10.000 km", interval: "10.000 km" },
  { id: "20000", label: "10.001 – 20.000 km", interval: "20.000 km" },
  { id: "20000+", label: "Más de 20.000 km", interval: "20.000+ km" },
];

const OIL_TYPES = [
  {
    id: "mineral",
    label: "Mineral",
    desc: "Recomendado para autos con más de 10 años o motores simples.",
    basePrice: 120000,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
  },
  {
    id: "semis",
    label: "Semisintético",
    desc: "Mejor protección. Ideal para motores modernos con uso mixto ciudad/ruta.",
    basePrice: 210000,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/30",
  },
  {
    id: "sintetico",
    label: "Sintético",
    desc: "Máxima protección. Para motores de alto rendimiento o turboalimentados.",
    basePrice: 340000,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
  },
];

const EXTRAS = [
  { id: "filtro_aceite", label: "Filtro de aceite", price: 35000, icon: "🔩" },
  { id: "filtro_aire", label: "Filtro de aire", price: 45000, icon: "💨" },
  { id: "filtro_combustible", label: "Filtro de combustible", price: 55000, icon: "⛽" },
  { id: "filtro_habitaculo", label: "Filtro de habitáculo", price: 40000, icon: "🌬️" },
  { id: "liquido_frenos", label: "Líquido de frenos", price: 50000, icon: "🔴" },
  { id: "refrigerante", label: "Refrigerante / Anticongelante", price: 60000, icon: "🧊" },
];

const STEPS = ["Vehículo", "Aceite", "Extras", "Cotización"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  "Gs. " + new Intl.NumberFormat("es-PY").format(Math.round(n));

// ─── Component ───────────────────────────────────────────────────────────────

export default function Cotizador() {
  const [step, setStep] = useState(0);
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [engine, setEngine] = useState<string | null>(null);
  const [kmRange, setKmRange] = useState<string | null>(null);
  const [oilType, setOilType] = useState<string | null>(null);
  const [extras, setExtras] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");

  const canNext = useMemo(() => {
    if (step === 0) return vehicleType !== null && engine !== null && kmRange !== null;
    if (step === 1) return oilType !== null;
    if (step === 2) return true;
    return false;
  }, [step, vehicleType, engine, kmRange, oilType]);

  const engineMultiplier = useMemo(
    () => ENGINES.find((e) => e.id === engine)?.multiplier ?? 1,
    [engine]
  );

  const selectedOil = useMemo(
    () => OIL_TYPES.find((o) => o.id === oilType),
    [oilType]
  );

  const oilTotal = selectedOil ? selectedOil.basePrice * engineMultiplier : 0;

  const extrasTotal = [...extras].reduce((acc, id) => {
    const extra = EXTRAS.find((e) => e.id === id);
    return acc + (extra?.price ?? 0);
  }, 0);

  const total = oilTotal + extrasTotal;

  const toggleExtra = (id: string) => {
    setExtras((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const buildWhatsAppMessage = () => {
    const vt = VEHICLE_TYPES.find((v) => v.id === vehicleType);
    const eng = ENGINES.find((e) => e.id === engine);
    const km = KM_RANGES.find((k) => k.id === kmRange);
    const extrasLine = [...extras]
      .map((id) => {
        const e = EXTRAS.find((x) => x.id === id);
        return e ? `  • ${e.label}: ${fmt(e.price)}` : "";
      })
      .join("\n");

    const lines = [
      `🔧 *Cotización de Mantenimiento — Lubrimec*`,
      name ? `👤 Cliente: ${name}` : "",
      ``,
      `🚗 Vehículo: ${vt?.label}`,
      `⚙️ Motor: ${eng?.label}`,
      `📏 Kilometraje: ${km?.label}`,
      ``,
      `🛢️ Aceite: ${selectedOil?.label} — ${fmt(oilTotal)}`,
      extrasLine ? `\n🔩 Extras:\n${extrasLine}` : "",
      ``,
      `💰 *Total estimado: ${fmt(total)}*`,
      ``,
      `¿Pueden confirmar disponibilidad y agendar turno?`,
    ]
      .filter(Boolean)
      .join("\n");

    return encodeURIComponent(lines);
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="pt-24 pb-8 px-4 bg-gradient-to-b from-card/40 to-transparent border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Herramienta interactiva</p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                COTIZADOR DE MANTENIMIENTO
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-sm ml-13">
            Calculá el costo estimado del mantenimiento para tu vehículo y enviá la cotización por WhatsApp.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all ${
                  i < step
                    ? "bg-emerald-500 border-emerald-500 text-white cursor-pointer"
                    : i === step
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-transparent border-border text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </button>
              <span className={`hidden sm:inline ml-1.5 text-xs font-medium mr-2 ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${i < step ? "bg-emerald-500" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -16 }}>
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" /> Datos del vehículo
              </h2>

              {/* Vehicle type */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-foreground mb-3">Tipo de vehículo</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {VEHICLE_TYPES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setVehicleType(v.id);
                        if (v.id === "moto") setEngine("moto");
                        else if (engine === "moto") setEngine(null);
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                        vehicleType === v.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      <span className="text-3xl">{v.icon}</span>
                      <span className="text-xs font-semibold leading-tight">{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Engine */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-foreground mb-3">
                  <Gauge className="w-4 h-4 inline mr-1.5" />Cilindrada del motor
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ENGINES.filter((e) => vehicleType === "moto" ? e.id === "moto" : e.id !== "moto").map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setEngine(e.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        engine === e.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {e.label}
                      {engine === e.id && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* KM range */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Kilometraje actual</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {KM_RANGES.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => setKmRange(k.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        kmRange === k.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {k.label}
                      {kmRange === k.id && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -16 }}>
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="text-2xl">🛢️</span> Tipo de aceite
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Seleccioná el tipo de aceite recomendado para tu vehículo.</p>

              <div className="space-y-4">
                {OIL_TYPES.map((oil) => {
                  const price = oil.basePrice * engineMultiplier;
                  const active = oilType === oil.id;
                  return (
                    <button
                      key={oil.id}
                      onClick={() => setOilType(oil.id)}
                      className={`w-full text-left px-5 py-5 rounded-2xl border-2 transition-all ${
                        active
                          ? `${oil.border} ${oil.bg}`
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className={`text-base font-bold mb-1 ${active ? oil.color : "text-foreground"}`}>
                            {oil.label}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{oil.desc}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={`text-lg font-bold ${active ? oil.color : "text-foreground"}`}>{fmt(price)}</p>
                          {active && <CheckCircle2 className={`w-5 h-5 ${oil.color} mt-1 ml-auto`} />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-secondary/40 border border-border">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Los precios incluyen la mano de obra del cambio de aceite. El precio varía según la cilindrada del motor.
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -16 }}>
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" /> Servicios adicionales
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Agregá los servicios que necesite tu vehículo (opcional).</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXTRAS.map((extra) => {
                  const active = extras.has(extra.id);
                  return (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra.id)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 text-left transition-all ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <span className="text-2xl">{extra.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${active ? "text-primary" : "text-foreground"}`}>
                          {extra.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{fmt(extra.price)}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${active ? "border-primary bg-primary" : "border-border"}`}>
                        {active && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {extras.size === 0 && (
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Sin extras seleccionados. Podés continuar sin agregar servicios adicionales.
                </p>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -16 }}>
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Tu cotización
              </h2>

              {/* Summary */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Resumen</p>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{VEHICLE_TYPES.find(v => v.id === vehicleType)?.icon}</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Vehículo</p>
                      <p className="text-sm font-semibold text-foreground">{VEHICLE_TYPES.find(v => v.id === vehicleType)?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚙️</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Motor</p>
                      <p className="text-sm font-semibold text-foreground">{ENGINES.find(e => e.id === engine)?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📏</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Kilometraje</p>
                      <p className="text-sm font-semibold text-foreground">{KM_RANGES.find(k => k.id === kmRange)?.label}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border px-5 py-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Aceite {selectedOil?.label}</span>
                    <span className="font-semibold text-foreground">{fmt(oilTotal)}</span>
                  </div>
                  {[...extras].map((id) => {
                    const extra = EXTRAS.find((e) => e.id === id);
                    return extra ? (
                      <div key={id} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{extra.icon} {extra.label}</span>
                        <span className="font-semibold text-foreground">{fmt(extra.price)}</span>
                      </div>
                    ) : null;
                  })}
                </div>

                <div className="border-t border-border px-5 py-4 flex justify-between items-center bg-primary/5">
                  <span className="text-base font-bold text-foreground">Total estimado</span>
                  <span className="text-2xl font-bold text-primary">{fmt(total)}</span>
                </div>
              </div>

              {/* Name input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="cotizador-name">
                  Tu nombre (opcional)
                </label>
                <input
                  id="cotizador-name"
                  type="text"
                  placeholder="Ej: Juan García"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-4 rounded-xl bg-secondary/40 border border-border mb-6">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta cotización es <strong className="text-foreground">estimada</strong> y puede variar según el vehículo y la disponibilidad de productos. Nuestro equipo confirmará el precio exacto al agendar el turno.
                </p>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/595974759037?text=${buildWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-base transition-all hover:scale-[1.02] shadow-lg shadow-green-500/25"
              >
                <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
                  <path fill="#fff" d="M16.03 3C9.22 3 3.98 8.24 3.98 15.05c0 2.65.86 5.1 2.34 7.11L3 29l6.18-3.29c1.86 1.03 3.98 1.59 6.85 1.59 6.81 0 12.05-5.24 12.05-12.05S22.84 3 16.03 3zm6.87 18.22c-.26.73-1.49 1.39-2.07 1.47-.54.08-1.2.12-2.98-.44-2.57-.86-4.23-2.98-4.36-3.13-.13-.16-1.04-1.22-1.04-2.33 0-1.11.64-1.66.87-1.89.23-.23.5-.26.68-.26.17 0 .35 0 .5.01.16.01.38-.06.59.45.21.51.71 1.76.77 1.9.06.14.1.3.02.48-.08.18-.12.3-.24.46-.12.16-.26.36-.36.49-.12.16-.24.34-.1.57.14.23.62 1.02 1.33 1.65.92.82 1.69 1.2 2.01 1.34.32.14.51.12.7-.07.19-.19.83-.98 1.05-1.32.22-.34.43-.28.72-.17.29.11 1.83.86 2.14 1.01.31.15.52.23.6.36.08.13.08.76-.18 1.49z" />
                </svg>
                <Send className="w-5 h-5" />
                Enviar cotización por WhatsApp
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-10">
          <button
            onClick={prev}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {step < 3 && (
            <button
              onClick={next}
              disabled={!canNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-105 shadow-md shadow-primary/20"
            >
              {step === 2 ? "Ver cotización" : "Continuar"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
