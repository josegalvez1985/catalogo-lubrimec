import { useState } from "react";
import { ChevronDown, X, SlidersHorizontal, PanelLeftClose } from "lucide-react";

type ExpandedSections = {
  rubro: boolean;
  viscosidad: boolean;
  marca: boolean;
};

/* ---------- Sidebar desktop (radios, secciones colapsables) ---------- */
function FilterSection({
  title,
  section,
  items,
  activeId,
  onSelect,
  getLabel,
  expanded,
  onToggle,
}: {
  title: string;
  section: keyof ExpandedSections;
  items: any[];
  activeId: number | null;
  onSelect: (id: number | null) => void;
  getLabel: (item: any) => string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-0 hover:text-primary transition-colors"
      >
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div style={{ transform: `rotate(${expanded ? 0 : -90}deg)`, transition: "transform 0.2s" }}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {expanded && (
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">Cargando...</p>
          ) : (
            <>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name={section}
                  checked={activeId === null}
                  onChange={() => onSelect(null)}
                  className="w-4 h-4 cursor-pointer accent-primary"
                />
                <span className="text-sm text-muted-foreground">Todas</span>
              </label>

              {items.map((item) => {
                const itemId = item.id_rubro ?? item.id_viscosidad ?? item.id_marca;
                return (
                  <label
                    key={itemId}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name={section}
                      checked={activeId === itemId}
                      onChange={() => onSelect(itemId)}
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <span className="text-sm text-foreground">{getLabel(item)}</span>
                  </label>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Grupo de chips (bottom sheet móvil) ---------- */
function ChipGroup({
  title,
  items,
  activeId,
  onSelect,
  getLabel,
}: {
  title: string;
  items: any[];
  activeId: number | null;
  onSelect: (id: number | null) => void;
  getLabel: (item: any) => string;
}) {
  const chipClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-card/60 text-foreground border-border hover:border-primary/40"
    }`;

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onSelect(null)} className={chipClass(activeId === null)}>
            Todas
          </button>
          {items.map((item) => {
            const itemId = item.id_rubro ?? item.id_viscosidad ?? item.id_marca;
            return (
              <button key={itemId} onClick={() => onSelect(itemId)} className={chipClass(activeId === itemId)}>
                {getLabel(item)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  rubros: Array<{ id_rubro: number; descripcion_rubro: string }>;
  viscosidades: Array<{ id_viscosidad: number; descripcion: string }>;
  marcas: Array<{ id_marca: number; descripcion_marca: string }>;
  activeRubroId: number | null;
  activeViscosidadId: number | null;
  activeMarcaId: number | null;
  onRubroChange: (id: number | null) => void;
  onViscosidadChange: (id: number | null) => void;
  onMarcaChange: (id: number | null) => void;
  onClearAll: () => void;
  resultCount?: number;
}

export default function FilterSidebar({
  isOpen,
  onClose,
  rubros,
  viscosidades,
  marcas,
  activeRubroId,
  activeViscosidadId,
  activeMarcaId,
  onRubroChange,
  onViscosidadChange,
  onMarcaChange,
  onClearAll,
  resultCount,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    rubro: true,
    viscosidad: true,
    marca: true,
  });
  const [collapsed, setCollapsed] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = activeRubroId != null || activeViscosidadId != null || activeMarcaId != null;

  return (
    <>
      {/* ===================== MÓVIL: bottom sheet ===================== */}
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 lg:hidden bg-card rounded-t-[2.5rem] border-t border-border shadow-2xl flex flex-col max-h-[85vh] transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header sticky con barra de arrastre + cerrar */}
        <div className="shrink-0 pt-3 pb-3 px-6 border-b border-border">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Filtros</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 hover:bg-secondary/50 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Cerrar filtros"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido scrollable (chips) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <ChipGroup title="Categorías" items={rubros} activeId={activeRubroId} onSelect={onRubroChange} getLabel={(i) => i.descripcion_rubro} />
          <ChipGroup title="Viscosidad" items={viscosidades} activeId={activeViscosidadId} onSelect={onViscosidadChange} getLabel={(i) => i.descripcion} />
          <ChipGroup title="Marca" items={marcas} activeId={activeMarcaId} onSelect={onMarcaChange} getLabel={(i) => i.descripcion_marca} />
        </div>

        {/* Barra de acción fija */}
        <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-t border-border">
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="px-5 py-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors"
            >
              Limpiar
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-colors"
          >
            {resultCount != null ? `Ver ${resultCount} resultados` : "Ver resultados"}
          </button>
        </div>
      </div>

      {/* ===================== DESKTOP: sidebar lateral ===================== */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex items-center gap-2 self-start mt-4 ml-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-md border border-border text-foreground hover:border-primary/40 hover:text-primary text-sm font-medium transition-colors shadow-sm"
          aria-label="Mostrar filtros"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Mostrar filtros
        </button>
      )}

      <aside
        className={`hidden lg:block relative w-72 bg-card/60 backdrop-blur-md border border-border rounded-2xl m-4 overflow-y-auto ${
          collapsed ? "lg:hidden" : ""
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Filtros</h2>
            <button
              onClick={() => setCollapsed(true)}
              className="p-2 hover:bg-secondary/50 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Ocultar filtros"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <FilterSection title="Categorías" section="rubro" items={rubros} activeId={activeRubroId} onSelect={onRubroChange} getLabel={(i) => i.descripcion_rubro} expanded={expandedSections.rubro} onToggle={() => toggleSection("rubro")} />
            <FilterSection title="Viscosidad" section="viscosidad" items={viscosidades} activeId={activeViscosidadId} onSelect={onViscosidadChange} getLabel={(i) => i.descripcion} expanded={expandedSections.viscosidad} onToggle={() => toggleSection("viscosidad")} />
            <FilterSection title="Marca" section="marca" items={marcas} activeId={activeMarcaId} onSelect={onMarcaChange} getLabel={(i) => i.descripcion_marca} expanded={expandedSections.marca} onToggle={() => toggleSection("marca")} />
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="w-full mt-6 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
