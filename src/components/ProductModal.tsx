import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Package, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";
import { WHATSAPP_NUMBER } from "@/data/products";

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ProductModal = ({ product, open, onClose }: ProductModalProps) => {
  if (!product) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(price);

  const whatsappMessage = encodeURIComponent(
    `¡Hola Lubrimec! 🛢️ Estoy interesado en: *${product.name}* (${formatPrice(product.price)}). ¿Está disponible?`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border-border gap-0">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square md:aspect-auto">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          <div className="p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">{product.name}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Precio</p>
                    <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Package className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Disponibilidad</p>
                    <p className="font-semibold text-foreground">
                      {product.stock > 0 ? `${product.stock} unidades disponibles` : "Agotado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full gap-2 bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-white font-semibold text-base py-6 rounded-xl">
                <MessageCircle className="w-5 h-5" />
                Consultar por WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
