import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Download,
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  ListChecks,
} from "lucide-react";
import {
  hoyISO,
  lunesDe,
  formatearFechaCorta,
  formatearFechaTexto,
  formatearHoras,
} from "../utils/dateUtils";
import { diasVisiblesSemana, etiquetaDias, horasActividad } from "../utils/jornada";
import { generarPDFReporte } from "../utils/pdfExport";
import { exportarCSV } from "../utils/csvExport";
import { exportarExcelActividades } from "../utils/fileIo";
import { formatearSolicitantes } from "../utils/solicitantes";

export default function ReportsModal({
  perfil,
  colorAcento,
  jornada,
  actividades,
  fechaReferencia,
  onCerrar,
}) {
  const [tipoReporte, setTipoReporte] = useState("semana");
  const [fechaBase, setFechaBase] = useState(fechaReferencia || hoyISO());
  const [desdePersonalizado, setDesdePersonalizado] = useState(
    lunesDe(fechaReferencia || hoyISO())
  );
  const [hastaPersonalizado, setHastaPersonalizado] = useState(fechaReferencia || hoyISO());

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCerrar]);

  const { actividadesFiltradas, tituloPeriodo, rangoTexto } = useMemo(() => {
    let filtradas = [];
    let titulo = "";
    let rango = "";

    if (tipoReporte === "dia") {
      filtradas = actividades.filter((a) => a.fecha === fechaBase);
      titulo = `Reporte Diario · ${formatearFechaTexto(fechaBase)}`;
      rango = formatearFechaCorta(fechaBase);
    } else if (tipoReporte === "semana") {
      const lunes = lunesDe(fechaBase);
      const fechasSet = new Set(actividades.map((a) => a.fecha));
      const fechasSemana = diasVisiblesSemana(lunes, jornada, fechasSet);
      const inicio = fechasSemana[0] || lunes;
      const fin = fechasSemana[fechasSemana.length - 1] || sumarDias(lunes, 6);

      filtradas = actividades.filter((a) => a.fecha >= inicio && a.fecha <= fin);
      titulo = `Reporte Semanal (${etiquetaDias(jornada.dias)})`;
      rango = `Del ${formatearFechaCorta(inicio)} al ${formatearFechaCorta(fin)}`;
    } else if (tipoReporte === "mes") {
      const año = fechaBase.slice(0, 4);
      const mes = fechaBase.slice(5, 7);
      filtradas = actividades.filter((a) => a.fecha.startsWith(`${año}-${mes}`));

      const fechaObj = new Date(`${año}-${mes}-02T00:00:00`);
      const nombreMes = fechaObj.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
      titulo = `Reporte Mensual · ${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}`;
      rango = `Mes completo (${año}-${mes})`;
    } else if (tipoReporte === "periodo") {
      const inicio = desdePersonalizado <= hastaPersonalizado ? desdePersonalizado : hastaPersonalizado;
      const fin = desdePersonalizado <= hastaPersonalizado ? hastaPersonalizado : desdePersonalizado;

      filtradas = actividades.filter((a) => a.fecha >= inicio && a.fecha <= fin);
      titulo = "Reporte por Periodo";
      rango = `Del ${formatearFechaCorta(inicio)} al ${formatearFechaCorta(fin)}`;
    }

    filtradas.sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return (a.hora_inicio || "").localeCompare(b.hora_inicio || "");
    });

    return {
      actividadesFiltradas: filtradas,
      tituloPeriodo: titulo,
      rangoTexto: rango,
    };
  }, [tipoReporte, fechaBase, desdePersonalizado, hastaPersonalizado, actividades, jornada]);

  const metricas = useMemo(() => {
    let totalHoras = 0;
    let horasCompletadas = 0;

    actividadesFiltradas.forEach((act) => {
      const h = horasActividad(act, jornada);
      totalHoras += h;
      if (act.estado === "completado") horasCompletadas += h;
    });

    const metaSemanal = Number(perfil.meta_horas_semanales) || 0;

    return {
      totalActividades: actividadesFiltradas.length,
      totalHoras,
      horasCompletadas,
      metaSemanal,
    };
  }, [actividadesFiltradas, jornada, perfil.meta_horas_semanales]);

  const descargarPDF = async () => {
    try {
      await generarPDFReporte({
        perfil,
        colorAcento,
        tituloPeriodo,
        rangoTexto,
        jornada,
        actividades: actividadesFiltradas,
      });
    } catch (err) {
      alert("Error al generar PDF: " + err.message);
    }
  };

  const descargarExcel = async () => {
    try {
      await exportarExcelActividades({
        perfil,
        jornada,
        actividades: actividadesFiltradas,
        tituloPeriodo,
      });
    } catch (err) {
      alert("Error al exportar a Excel: " + err.message);
    }
  };

  const descargarCSV = async () => {
    try {
      await exportarCSV({
        perfil,
        tituloPeriodo,
        jornada,
        actividades: actividadesFiltradas,
      });
    } catch (err) {
      alert("Error al exportar CSV: " + err.message);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reports-modal-title"
    >
      <div className="modal-box modal-wide">
        <div className="modal-header">
          <div>
            <h3 id="reports-modal-title" className="modal-title">
              Reportes de Actividades y Horas
            </h3>
            <span className="modal-subtitle">
              Exporta tu informe en PDF o Excel con el detalle de las actividades registradas
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

        <div className="reports-body">
          <div className="reports-control-bar">
            <div className="report-type-selector" role="tablist" aria-label="Tipo de periodo">
              <button
                type="button"
                role="tab"
                aria-selected={tipoReporte === "semana"}
                className={`report-tab ${tipoReporte === "semana" ? "active" : ""}`}
                onClick={() => setTipoReporte("semana")}
              >
                Semanal
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tipoReporte === "mes"}
                className={`report-tab ${tipoReporte === "mes" ? "active" : ""}`}
                onClick={() => setTipoReporte("mes")}
              >
                Mensual
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tipoReporte === "dia"}
                className={`report-tab ${tipoReporte === "dia" ? "active" : ""}`}
                onClick={() => setTipoReporte("dia")}
              >
                Por Día
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tipoReporte === "periodo"}
                className={`report-tab ${tipoReporte === "periodo" ? "active" : ""}`}
                onClick={() => setTipoReporte("periodo")}
              >
                Rango Libre
              </button>
            </div>

            <div className="report-date-pickers">
              {tipoReporte !== "periodo" ? (
                <div className="form-inline">
                  <label htmlFor="rep-fecha-ref" className="input-sublabel">
                    Fecha de referencia:
                  </label>
                  <input
                    id="rep-fecha-ref"
                    type="date"
                    className="form-input form-input-sm"
                    value={fechaBase}
                    onChange={(e) => setFechaBase(e.target.value)}
                  />
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <div className="form-inline">
                    <label htmlFor="rep-desde" className="input-sublabel">
                      Desde:
                    </label>
                    <input
                      id="rep-desde"
                      type="date"
                      className="form-input form-input-sm"
                      value={desdePersonalizado}
                      onChange={(e) => setDesdePersonalizado(e.target.value)}
                    />
                  </div>
                  <div className="form-inline">
                    <label htmlFor="rep-hasta" className="input-sublabel">
                      Hasta:
                    </label>
                    <input
                      id="rep-hasta"
                      type="date"
                      className="form-input form-input-sm"
                      value={hastaPersonalizado}
                      onChange={(e) => setHastaPersonalizado(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="report-meta-card">
            <div className="meta-left">
              <div className="meta-title">{tituloPeriodo}</div>
              <div className="meta-range">
                {rangoTexto}
                {perfil.institucion
                  ? ` · ${perfil.institucion}${perfil.cargo ? ` (${perfil.cargo})` : ""}`
                  : ""}
              </div>
            </div>

            <div className="report-export-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={descargarPDF}
                disabled={actividadesFiltradas.length === 0}
                title="Generar y guardar reporte en PDF formal con firmas"
              >
                <Download size={15} />
                <span>Descargar PDF</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={descargarExcel}
                disabled={actividadesFiltradas.length === 0}
                title="Descargar libro estructurado de Microsoft Excel (.xlsx)"
              >
                <FileSpreadsheet size={15} />
                <span>Exportar Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={descargarCSV}
                disabled={actividadesFiltradas.length === 0}
                title="Exportar archivo de texto CSV delimitado"
              >
                <FileText size={15} />
                <span>Exportar CSV</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-icon-only"
                onClick={() => window.print()}
                title="Imprimir"
                aria-label="Imprimir"
              >
                <Printer size={15} />
              </button>
            </div>
          </div>

          <div className="report-kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon-wrapper accent">
                <Clock size={18} />
              </div>
              <div>
                <div className="kpi-value">{formatearHoras(metricas.totalHoras)}</div>
                <div className="kpi-label">
                  Horas Totales ({metricas.totalHoras.toFixed(1)}h)
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrapper green">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="kpi-value">{formatearHoras(metricas.horasCompletadas)}</div>
                <div className="kpi-label">Horas Completadas</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-wrapper neutral">
                <ListChecks size={18} />
              </div>
              <div>
                <div className="kpi-value">
                  {metricas.totalActividades}{" "}
                  {metricas.totalActividades === 1 ? "actividad" : "actividades"}
                </div>
                <div className="kpi-label">
                  {metricas.metaSemanal > 0
                    ? `Meta semanal: ${metricas.metaSemanal}h/sem`
                    : "Actividades en el rango"}
                </div>
              </div>
            </div>
          </div>

          <div className="report-preview-table-wrap">
            <div className="table-caption">
              Actividades registradas en el periodo ({actividadesFiltradas.length})
            </div>

            {actividadesFiltradas.length === 0 ? (
              <div className="empty-report-state">
                <AlertCircle size={22} className="text-amber" />
                <p>No hay actividades registradas en este periodo.</p>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha</th>
                      <th>Horario</th>
                      <th>Horas</th>
                      <th>Solicitante(s)</th>
                      <th>Actividad / Descripción</th>
                      <th>Entregable / Avance</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actividadesFiltradas.map((act, idx) => (
                      <tr key={act.id}>
                        <td className="text-muted">{idx + 1}</td>
                        <td>
                          <strong>{formatearFechaCorta(act.fecha)}</strong>
                        </td>
                        <td>
                          {act.hora_inicio || "--:--"} - {act.hora_fin || "--:--"}
                        </td>
                        <td>
                          <strong>{horasActividad(act, jornada)}h</strong>
                        </td>
                        <td>{formatearSolicitantes(act) || "-"}</td>
                        <td>{act.descripcion}</td>
                        <td>{act.entregable || "-"}</td>
                        <td>
                          <span
                            className={`badge-status ${
                              act.estado === "completado"
                                ? "badge-completed"
                                : act.estado === "en_progreso"
                                  ? "badge-in-progress"
                                  : "badge-pending"
                            }`}
                          >
                            {(act.estado || "completado").toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onCerrar}>
            Cerrar
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={descargarExcel}
            disabled={actividadesFiltradas.length === 0}
            title="Descargar libro de Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet size={15} />
            <span>Descargar Excel</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={descargarPDF}
            disabled={actividadesFiltradas.length === 0}
            title="Descargar reporte en documento PDF"
          >
            <Download size={16} />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
