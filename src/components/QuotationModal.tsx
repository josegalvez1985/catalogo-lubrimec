import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, X } from 'lucide-react';
import {
  buildQuotationCanvas,
  type QuotationData,
  type ThemeId,
  type FormatId,
} from '@/lib/quotationCanvas';

interface ApiAceite {
  id: number;
  nombre: string;
  precioBase: number;
  stock: number;
  unidad: string;
  imagen?: {
    nombre: string;
    mimeType: string;
    datos?: string;
  };
}

interface ApiFiltro {
  id: number;
  nombre: string;
  precio: number;
  imagen?: any;
}

interface ApiCotizacionResultado {
  aceites: ApiAceite[];
  filtros: {
    aceite?: ApiFiltro;
    aire?: ApiFiltro;
    combustible?: ApiFiltro;
    caja?: ApiFiltro;
  };
  totales: {
    sinDescuento: number;
    conDescuento: number;
    porcentajeDescuento: number;
  };
}

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: QuotationData;
  apiData?: {
    resultado: ApiCotizacionResultado;
  };
}

const THEMES: Array<{ id: ThemeId; name: string; color: string }> = [
  { id: 'dark', name: 'Oscuro', color: 'bg-slate-900' },
  { id: 'light', name: 'Claro', color: 'bg-amber-50' },
  { id: 'green', name: 'Verde', color: 'bg-emerald-900' },
  { id: 'blue', name: 'Azul', color: 'bg-blue-900' },
  { id: 'purple', name: 'Púrpura', color: 'bg-purple-900' },
  { id: 'pink', name: 'Rosa', color: 'bg-pink-900' },
  { id: 'red', name: 'Rojo', color: 'bg-red-900' },
  { id: 'teal', name: 'Turquesa', color: 'bg-teal-900' },
  { id: 'indigo', name: 'Índigo', color: 'bg-indigo-900' },
  { id: 'orange', name: 'Naranja', color: 'bg-orange-900' },
];

const FORMATS: Array<{ id: FormatId; name: string; ratio: string; label: string }> = [
  { id: 'quote', name: 'Cotización', ratio: 'aspect-auto', label: 'Formato vertical' },
  { id: 'story', name: 'Historia', ratio: 'aspect-[9/16]', label: 'Instagram Story' },
  { id: 'post', name: 'Post', ratio: 'aspect-square', label: 'Instagram Post' },
  { id: 'reel', name: 'Reel', ratio: 'aspect-[9/16]', label: 'Instagram Reel' },
];

export default function QuotationModal({
  isOpen,
  onClose,
  data,
  apiData,
}: QuotationModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('dark');
  const [selectedFormat, setSelectedFormat] = useState<FormatId>('quote');
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Regenerar preview cuando cambia tema o formato
  useEffect(() => {
    if (!isOpen) return;

    const generatePreview = async () => {
      setLoading(true);
      try {
        const blob = await buildQuotationCanvas(data, selectedFormat, selectedTheme);
        const url = URL.createObjectURL(blob);
        setPreviewSrc(url);

        // Limpiar URL anterior si existe
        return () => URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generando preview:', error);
      } finally {
        setLoading(false);
      }
    };

    const cleanup = generatePreview();
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, [isOpen, selectedTheme, selectedFormat, data]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await buildQuotationCanvas(data, selectedFormat, selectedTheme);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cotizacion-${data.modelo.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur px-6 py-4">
            <h2 className="text-xl font-bold text-foreground">Generar Cotización</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-secondary transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Selector de tema */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Tema de colores (10 opciones)</h3>
              <div className="grid grid-cols-5 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`relative p-3 rounded-xl border-2 transition-all ${
                      selectedTheme === theme.id
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <div className={`${theme.color} w-full h-10 rounded-lg mb-1.5`} />
                    <p className="text-xs font-medium text-foreground text-center leading-tight">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de formato */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Formato</h3>
              <div className="grid grid-cols-3 gap-3">
                {FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all ${
                      selectedFormat === fmt.id
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground mb-1">{fmt.name}</p>
                    <p className="text-xs text-muted-foreground">{fmt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{fmt.ratio}</p>
                  </button>
                ))}
              </div>
            </div>


            {/* Botón de descarga */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDownload}
                disabled={downloading || loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Descargar imagen
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-secondary transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
