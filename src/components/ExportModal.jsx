import React, { useState } from "react";
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Calendar,
  Check,
} from "lucide-react";
import { exportarExcelActividades } from "../utils/fileIo";
import { exportarCSV } from "../utils/csvExport";
import { generarPDFReporte } from "../utils/pdfExport";
import { exportarBackupJSON } from "../utils/storage";
import { lunesDe, sumarDias, formatearFechaCorta } from "../utils/dateUtils";

export default function ExportModal({
  perfil,
  colorAcento,
  jornada,
  actividades,
  fechaReferencia,
  onCerrar,
  onNotificar,
}) {
  const [alcance, setAlcance] = useState("todas"); // "todas" | "semana"
  const [descargando, setDescargando] = useState(null);

  // Filtrar actividades según el alcance seleccionado
  const lunes = lunesDe(fechaReferencia);
  const domingo = sumarDias(lunes, 6);

  const actividadesExportar = React.useMemo(() => {
    if (alcance === "semana") {
      return actividades.filter((a) => a.fecha >= lunes && a.fecha <= domingo);
    }
    return actividades;
  }, [alcance, actividades, lunes, domingo]);

  const tituloPeriodo =
    alcance === "semana"
      ? `Semana del ${formatearFechaCorta(lunes)} al ${formatearFechaCorta(domingo)}`
      : "Historial completo de actividades";

  const handleDescargarExcel = async () => {
    try {
      setDescargando("xlsx");
      const ok = await exportarExcelActividades({
        perfil,
        jornada,
        actividades: actividadesExportar,
        tituloPeriodo,
      });
      if (ok && onNotificar) {
        onNotificar("Archivo Excel (.xlsx) generado y guardado correctamente");
      }
    } catch (err) {
      alert("Error al exportar a Excel: " + err.message);
    } finally {
      setDescargando(null);
    }
  };

  const handleDescargarPDF = async () => {
    try {
      setDescargando("pdf");
      const ok = await generarPDFReporte({
        perfil,
        colorAcento,
        tituloPeriodo,
        rangoTexto:
          alcance === "semana"
            ? `${formatearFechaCorta(lunes)} - ${formatearFechaCorta(domingo)}`
            : `Registro general (${actividadesExportar.length} actividades)`,
        jornada,
        actividades: actividadesExportar,
      });
      if (ok && onNotificar) {
        onNotificar("Reporte en PDF generado y guardado correctamente");
      }
    } catch (err) {
      alert("Error al generar PDF: " + err.message);
    } finally {
      setDescargando(null);
    }
  };

  const handleDescargarCSV = async () => {
    try {
      setDescargando("csv");
      const ok = await exportarCSV({
        perfil,
        jornada,
        actividades: actividadesExportar,
      });
      if (ok && onNotificar) {
        onNotificar("Archivo CSV exportado y guardado correctamente");
      }
    } catch (err) {
      alert("Error al exportar CSV: " + err.message);
    } finally {
      setDescargando(null);
    }
  };

  const handleDescargarJSON = async () => {
    try {
      setDescargando("json");
      const ok = await exportarBackupJSON();
      if (ok && onNotificar) {
        onNotificar("Copia de seguridad JSON guardada correctamente");
      }
    } catch (err) {
      alert("Error al guardar respaldo JSON: " + err.message);
    } finally {
      setDescargando(null);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="modal-box modal-medium">
        <div className="modal-header">
          <div>
            <h3 id="export-modal-title" className="modal-title">
              Descargar y Exportar Actividades
            </h3>
            <span className="modal-subtitle">
              Elige el formato de archivo que deseas generar y guardar en tu equipo
            </span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCerrar}
            aria-label="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-form">
          {/* Selector de Alcance */}
          <div className="form-group">
            <label className="form-label">Periodo de actividades a incluir:</label>
            <div className="export-scope-selector" role="radiogroup">
              <button
                type="button"
                className={`scope-pill ${alcance === "todas" ? "active" : ""}`}
                onClick={() => setAlcance("todas")}
              >
                {alcance === "todas" && <Check size={14} />}
                <span>Todas las actividades ({actividades.length})</span>
              </button>
              <button
                type="button"
                className={`scope-pill ${alcance === "semana" ? "active" : ""}`}
                onClick={() => setAlcance("semana")}
              >
                {alcance === "semana" && <Check size={14} />}
                <Calendar size={14} />
                <span>Solo la semana actual ({actividadesExportar.length})</span>
              </button>
            </div>
          </div>

          {/* Opciones de Formato */}
          <div className="export-cards-grid">
            {/* Tarjeta Excel */}
            <div className="export-option-card">
              <div className="export-card-icon excel">
                <FileSpreadsheet size={24} />
              </div>
              <div className="export-card-content">
                <div className="export-card-title">Microsoft Excel (.xlsx)</div>
                <div className="export-card-desc">
                  Hoja de cálculo estructurada con fórmulas de horas netas, desglose por solicitante y metadatos de trabajo.
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleDescargarExcel}
                disabled={descargando !== null || actividadesExportar.length === 0}
              >
                <Download size={14} />
                <span>{descargando === "xlsx" ? "Generando..." : "Descargar Excel"}</span>
              </button>
            </div>

            {/* Tarjeta PDF */}
            <div className="export-option-card">
              <div className="export-card-icon pdf">
                <FileText size={24} />
              </div>
              <div className="export-card-content">
                <div className="export-card-title">Documento PDF (.pdf)</div>
                <div className="export-card-desc">
                  Informe formal con membrete institucional, firmas de responsabilidad y detalle imprimible.
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleDescargarPDF}
                disabled={descargando !== null || actividadesExportar.length === 0}
              >
                <Download size={14} />
                <span>{descargando === "pdf" ? "Generando..." : "Descargar PDF"}</span>
              </button>
            </div>

            {/* Tarjeta CSV */}
            <div className="export-option-card">
              <div className="export-card-icon csv">
                <FileText size={24} />
              </div>
              <div className="export-card-content">
                <div className="export-card-title">Archivo CSV (.csv)</div>
                <div className="export-card-desc">
                  Formato de datos tabulares compatible con Excel, Google Sheets y sistemas de bases de datos.
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleDescargarCSV}
                disabled={descargando !== null || actividadesExportar.length === 0}
              >
                <Download size={14} />
                <span>{descargando === "csv" ? "Generando..." : "Descargar CSV"}</span>
              </button>
            </div>

            {/* Tarjeta JSON */}
            <div className="export-option-card">
              <div className="export-card-icon json">
                <FileJson size={24} />
              </div>
              <div className="export-card-content">
                <div className="export-card-title">Copia de Seguridad (.json)</div>
                <div className="export-card-desc">
                  Respaldo completo de todas las actividades, perfil personal, jornada y configuración de apariencia.
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleDescargarJSON}
                disabled={descargando !== null}
              >
                <Download size={14} />
                <span>{descargando === "json" ? "Guardando..." : "Descargar Copia"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
