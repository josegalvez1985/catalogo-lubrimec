import React from "react";
import placeholder from "@/assets/product-oil.jpg";

interface Props {
  articulo: {
    id_articulo: number;
    descripcion_articulo: string;
    imagen?: string;
  };
}

const ArticleCard: React.FC<Props> = ({ articulo }) => {
  const imgSrc = articulo.imagen || placeholder;
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <img
        src={imgSrc}
        alt={articulo.descripcion_articulo}
        className="w-full h-40 object-cover rounded-md mb-3"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          if (target.src !== placeholder) target.src = placeholder;
        }}
      />
      <h3 className="text-base font-medium text-foreground">{articulo.descripcion_articulo}</h3>
    </div>
  );
};

export default ArticleCard;
