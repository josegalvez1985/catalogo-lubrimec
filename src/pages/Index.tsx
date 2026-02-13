import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Droplets, Phone, MapPin } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { products, type Product } from "@/data/products";
import heroBanner from "@/assets/hero-banner.jpg";

const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "Todos" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative h-[70vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img src={heroBanner} alt="Lubrimec taller" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Droplets className="w-10 h-10 text-primary" />
            <h1 className="text-7xl md:text-8xl font-bold text-foreground tracking-wider">LUBRIMEC</h1>
            <Droplets className="w-10 h-10 text-primary" />
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground font-sans font-light tracking-wide">
            Tu lubricentro de confianza — Catálogo de productos
          </p>
        </motion.div>
      </header>

      {/* Filters */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} onClick={() => openModal(product)} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No se encontraron productos.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-primary" />
            <span className="text-2xl font-bold tracking-wider text-foreground">LUBRIMEC</span>
          </div>
          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> +595 981 123 456</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Asunción, Paraguay</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Lubrimec. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Modal */}
      <ProductModal product={selectedProduct} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Index;
