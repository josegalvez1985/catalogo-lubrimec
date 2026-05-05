import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

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
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    rubro: true,
    viscosidad: true,
    marca: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSelectFilter = (id: number | null, callback: (id: number | null) => void) => {
    callback(id);
    onClose();
  };

  const FilterSection = ({
    title,
    section,
    items,
    activeId,
    onSelect,
    getLabel,
  }: {
    title: string;
    section: keyof typeof expandedSections;
    items: any[];
    activeId: number | null;
    onSelect: (id: number | null) => void;
    getLabel: (item: any) => string;
  }) => (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-3 px-0 hover:text-primary transition-colors"
      >
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div
          style={{ transform: `rotate(${expandedSections[section] ? 0 : -90}deg)`, transition: "transform 0.2s" }}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {expandedSections[section] && (
          <div
            className="space-y-2"
          >
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">Cargando...</p>
            ) : (
              <>
                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={section}
                    checked={activeId === null}
                    onChange={() => handleSelectFilter(null, onSelect)}
                    className="w-4 h-4 cursor-pointer accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">Todas</span>
                </label>

                {items.map((item) => (
                  <label
                    key={item.id_rubro || item.id_viscosidad || item.id_marca}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name={section}
                      checked={activeId === (item.id_rubro || item.id_viscosidad || item.id_marca)}
                      onChange={() => handleSelectFilter(item.id_rubro || item.id_viscosidad || item.id_marca, onSelect)}
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <span className="text-sm text-foreground">{getLabel(item)}</span>
                  </label>
                ))}
              </>
            )}
          </div>
        )}
    </div>
  );

  const hasActiveFilters = activeRubroId != null || activeViscosidadId != null || activeMarcaId != null;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 bottom-0 w-72 bg-card border-r border-border z-50 overflow-y-auto transition-transform lg:translate-x-0 pt-16 lg:pt-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 lg:mb-4">
            <h2 className="text-lg font-bold text-foreground">Filtros</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-secondary/50 rounded-lg transition-colors"
              aria-label="Cerrar filtros"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Sections */}
          <div className="space-y-4">
            <FilterSection
              title="Categorías"
              section="rubro"
              items={rubros}
              activeId={activeRubroId}
              onSelect={onRubroChange}
              getLabel={(item) => item.descripcion_rubro}
            />

            <FilterSection
              title="Viscosidad"
              section="viscosidad"
              items={viscosidades}
              activeId={activeViscosidadId}
              onSelect={onViscosidadChange}
              getLabel={(item) => item.descripcion}
            />

            <FilterSection
              title="Marca"
              section="marca"
              items={marcas}
              activeId={activeMarcaId}
              onSelect={onMarcaChange}
              getLabel={(item) => item.descripcion_marca}
            />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                onClearAll();
                onClose();
              }}
              className="w-full mt-6 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
