export interface RankBadge {
  emoji: string;
  label: string;
  className: string;
  canvasColor: string;
  canvasBg: string;
}

/** Badge público de ranking. Solo se devuelven los positivos: decirle al
 *  cliente que un producto "casi no se vende" no ayuda a venderlo.
 */
export function getRankingBadge(rank: number, total: number): RankBadge | null {
  if (total === 0) return null;
  const pct = rank / total;
  if (pct <= 0.1) return { emoji: "🔥", label: "Top ventas", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", canvasColor: "#b91c1c", canvasBg: "#fee2e2" };
  if (pct <= 0.3) return { emoji: "⭐", label: "Muy vendido", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", canvasColor: "#92400e", canvasBg: "#fef3c7" };
  return null;
}

/** Calcula el badge de ranking para cada artículo dentro de un grupo (rubro, viscosidad, etc.)
 *  Retorna un Map<id_articulo, RankBadge> solo con los artículos destacados.
 *  Un artículo sin ventas nunca recibe badge, aunque su grupo sea chico.
 */
export function computeRankBadges(
  items: Array<{ id_articulo: number; cantidad_vendida?: number | null }>
): Map<number, RankBadge> {
  const result = new Map<number, RankBadge>();
  const hasSalesData = items.some((a) => (a.cantidad_vendida ?? 0) > 0);
  if (!hasSalesData) return result;

  const sorted = [...items].sort((a, b) => (b.cantidad_vendida ?? 0) - (a.cantidad_vendida ?? 0));
  sorted.forEach((a, i) => {
    if ((a.cantidad_vendida ?? 0) <= 0) return;
    const badge = getRankingBadge(i, sorted.length);
    if (badge) result.set(a.id_articulo, badge);
  });
  return result;
}
