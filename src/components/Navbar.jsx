import React from "react";
import {
  Calendar,
  Plus,
  FileText,
  Briefcase,
  Download,
  Upload,
  Tag,
  Palette,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export default function Navbar({
  perfil,
  tema,
  zoom = 100,
  onToggleTema,
  onCambiarZoom,
  onResetearZoom,
  onNuevaActividad,
  onAbrirReportes,
  onAbrirApariencia,
  onAbrirPerfil,
  onAbrirCatalogos,
  onAbrirDescarga,
  onImportarArchivo,
}) {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportarArchivo(file);
      e.target.value = "";
    }
  };

  const tienePerfilConfigurado = Boolean(
    perfil.nombre?.trim() || perfil.institucion?.trim() || perfil.cargo?.trim()
  );

  const subtituloTrabajo = [perfil.institucion, perfil.unidad_grupo, perfil.cargo]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Marca y subtítulo dinámico según donde trabaja el usuario */}
        <div className="navbar-brand">
          <div className="brand-icon" aria-hidden="true">
            <Calendar size={20} />
          </div>
          <div>
            <h1 className="brand-title">Control de Actividades</h1>
            <p className="brand-subtitle">
              {subtituloTrabajo || "Bitácora personal de trabajo"}
            </p>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="navbar-actions">
          {/* Botón primario directo para agregar actividad */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onNuevaActividad}
          >
            <Plus size={16} />
            <span>Agregar actividad</span>
          </button>

          {/* Botón de Reportes */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onAbrirReportes}
          >
            <FileText size={15} />
            <span>Reportes</span>
          </button>

          {/* Botón de Categorías */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onAbrirCatalogos}
          >
            <Tag size={15} />
            <span className="hide-mobile">Categorías</span>
          </button>

          {/* Botón de Personalización (Colores y Caligrafía) */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onAbrirApariencia}
            title="Personalizar colores y caligrafía"
          >
            <Palette size={15} />
            <span className="hide-mobile">Estilo</span>
          </button>

          {/* Configuración de lugar de trabajo, cargo, días laborables y almuerzo */}
          <button
            type="button"
            className={`profile-chip ${!tienePerfilConfigurado ? "profile-chip-empty" : ""}`}
            onClick={onAbrirPerfil}
            title="Configurar lugar de trabajo, cargo, días laborables, horas semanales y almuerzo"
          >
            <div className="profile-avatar" aria-hidden="true">
              <Briefcase size={14} />
            </div>
            <div className="profile-info">
              <span className="profile-name">
                {perfil.nombre?.trim() || "Configuración"}
              </span>
              <span className="profile-role">
                {perfil.cargo?.trim()
                  ? `${perfil.cargo}${perfil.institucion ? ` · ${perfil.institucion}` : ""}`
                  : "Trabajo, cargo y horario"}
              </span>
            </div>
          </button>

          {/* Botones de Descarga y Carga (Exportar e Importar) */}
          <div className="backup-buttons" role="group" aria-label="Descargar y cargar datos">
            <button
              type="button"
              className="btn btn-outline btn-icon-only"
              onClick={onAbrirDescarga}
              title="Descargar actividades (.xlsx, .pdf, .csv, .json)"
              aria-label="Descargar actividades (.xlsx, .pdf, .csv, .json)"
            >
              <Download size={15} />
            </button>
            <button
              type="button"
              className="btn btn-outline btn-icon-only"
              onClick={() => fileInputRef.current?.click()}
              title="Cargar / Importar archivo (.xlsx, .csv, .json)"
              aria-label="Cargar / Importar archivo (.xlsx, .csv, .json)"
            >
              <Upload size={15} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.json"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          {/* Controles de Zoom Variable */}
          <div className="zoom-controls" role="group" aria-label="Control de Zoom">
            <button
              type="button"
              className="btn btn-outline btn-icon-only btn-zoom"
              onClick={() => onCambiarZoom(-5)}
              title="Reducir zoom (Ctrl + Rueda abajo)"
              aria-label="Reducir zoom"
              disabled={zoom <= 70}
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              className="zoom-indicator-btn"
              onClick={onResetearZoom}
              title="Restablecer zoom al 100%"
              aria-label={`Zoom: ${zoom}%. Clic para restablecer al 100%`}
            >
              {zoom}%
            </button>
            <button
              type="button"
              className="btn btn-outline btn-icon-only btn-zoom"
              onClick={() => onCambiarZoom(5)}
              title="Aumentar zoom (Ctrl + Rueda arriba)"
              aria-label="Aumentar zoom"
              disabled={zoom >= 160}
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Botón rápido Modo Claro / Oscuro */}
          <button
            type="button"
            className="btn btn-outline btn-icon-only"
            onClick={onToggleTema}
            title={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            aria-label={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {tema === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
