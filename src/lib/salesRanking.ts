export interface RankBadge {
  emoji: string;
  label: string;
  className: string;
  canvasColor: string;
  canvasBg: string;
}

export function getRankingBadge(rank: number, total: number): RankBadge {
  if (total === 0) return { emoji: "🆕", label: "Nueva incorporación", className: "bg-muted text-muted-foreground", canvasColor: "#6b7280", canvasBg: "#f3f4f6" };
  const pct = rank / total;
  if (pct <= 0.1) return { emoji: "🔥", label: "Top ventas", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", canvasColor: "#b91c1c", canvasBg: "#fee2e2" };
  if (pct <= 0.3) return { emoji: "⭐", label: "Muy vendido", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", canvasColor: "#92400e", canvasBg: "#fef3c7" };
  if (pct <= 0.55) return { emoji: "👍", label: "Popular", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", canvasColor: "#1d4ed8", canvasBg: "#dbeafe" };
  if (pct <= 0.8) return { emoji: "📦", label: "Venta media", className: "bg-secondary text-muted-foreground", canvasColor: "#6b7280", canvasBg: "#f3f4f6" };
  return { emoji: "🆕", label: "Baja rotación", className: "bg-muted text-muted-foreground", canvasColor: "#6b7280", canvasBg: "#f3f4f6" };
}

/** Calcula el badge de ranking para cada artículo dentro de un grupo (rubro, viscosidad, etc.)
 *  Retorna un Map<id_articulo, RankBadge>.
 *  Solo asigna badge si al menos 1 artículo del grupo tiene cantidad_vendida > 0.
 */
export function computeRankBadges(
  items: Array<{ id_articulo: number; cantidad_vendida?: number | null }>
): Map<number, RankBadge> {
  const result = new Map<number, RankBadge>();
  const hasSalesData = items.some((a) => (a.cantidad_vendida ?? 0) > 0);
  if (!hasSalesData) return result;

  const sorted = [...items].sort((a, b) => (b.cantidad_vendida ?? 0) - (a.cantidad_vendida ?? 0));
  sorted.forEach((a, i) => {
    result.set(a.id_articulo, getRankingBadge(i, sorted.length));
  });
  return result;
}
