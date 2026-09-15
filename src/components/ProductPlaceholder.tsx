import { Droplets, Filter, Lightbulb, Package, type LucideIcon } from "lucide-react";

// Ícono por categoría para productos sin foto. Reemplaza al logo de la empresa,
// que repetido en la grilla parecía la foto del producto.
function iconForRubro(rubro?: string | null): LucideIcon {
  const r = (rubro ?? "").toLowerCase();
  if (r.includes("filtro")) return Filter;
  if (r.includes("aceite") || r.includes("lubricante")) return Droplets;
  if (r.includes("foco")) return Lightbulb;
  return Package;
}

interface Props {
  rubro?: string | null;
  iconClassName?: string;
}

export default function ProductPlaceholder({ rubro, iconClassName = "w-16 h-16" }: Props) {
  const Icon = iconForRubro(rubro);
  return (
    <div className="flex items-center justify-center w-full h-full text-gray-300" aria-hidden="true">
      <Icon className={iconClassName} strokeWidth={1.25} />
    </div>
  );
}
