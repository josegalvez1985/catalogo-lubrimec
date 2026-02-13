import { motion } from "framer-motion";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index: number;
}

const ProductCard = ({ product, onClick, index }: ProductCardProps) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer rounded-xl border border-border bg-card overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-300"
      onClick={onClick}
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
          {product.category}
        </span>
        {product.stock <= 5 && (
          <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1 rounded-full">
            ¡Últimas unidades!
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-sans text-lg font-semibold text-foreground mb-1 tracking-normal">{product.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
          <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
