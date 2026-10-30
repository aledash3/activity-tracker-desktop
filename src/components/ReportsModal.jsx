import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Download,
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
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

export default function ReportsModal({
  perfil,
  colorAcento,
  jornada,
  actividades,
  fechaReferencia,
  onCerrar,
}) {
  const [tipoReporte, setTipoReporte] = useState("semana"); // "dia" | "semana" | "mes" | "periodo"
  const [fechaBase, setFechaBase] = useState(fechaReferencia || hoyISO());
  const [desdePersonalizado, setDesdePersonalizado] = useState(
    lunesDe(hoyISO())
  );
  const [hastaPersonalizado, setHastaPersonalizado] = useState(hoyISO());

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCerrar]);

  const { desde, hasta, tituloPeriodo, rangoTexto } = useMemo(() => {
    if (tipoReporte === "dia") {
      return {
        desde: fechaBase,
        hasta: fechaBase,
        tituloPeriodo: `Reporte Diario (${formatearFechaCorta(fechaBase)})`,
        rangoTexto: formatearFechaTexto(fechaBase),
      };
    }
    if (tipoReporte === "semana") {
      const dias = diasVisiblesSemana(
        lunesDe(fechaBase),
        jornada,
        new Set(actividades.map((a) => a.fecha))
      );
      const primero = dias[0];
      const ultimo = dias[dias.length - 1];
      return {
        desde: primero,
        hasta: ultimo,
        tituloPeriodo: `Reporte Semanal (${etiquetaDias(jornada.dias)})`,
        rangoTexto:
          primero === ultimo
            ? formatearFechaCorta(primero)
            : `Del ${formatearFechaCorta(primero)} al ${formatearFechaCorta(ultimo)}`,
      };
    }
    if (tipoReporte === "mes") {
      const [y, m] = fechaBase.split("-").map(Number);
      const primerDia = `${y}-${String(m).padStart(2, "0")}-01`;
      const ultimoDiaNum = new Date(y, m, 0).getDate();
      const ultimoDia = `${y}-${String(m).padStart(2, "0")}-${String(ultimoDiaNum).padStart(2, "0")}`;
      const nombreMes = new Date(y, m - 1, 1).toLocaleDateString("es-EC", {
        month: "long",
        year: "numeric",
      });
      return {
        desde: primerDia,
        hasta: ultimoDia,
        tituloPeriodo: `Reporte Mensual (${nombreMes.toUpperCase()})`,
        rangoTexto: `Del 01 al ${ultimoDiaNum} de ${nombreMes}`,
      };
    }
    return {
      desde: desdePersonalizado,
      hasta: hastaPersonalizado,
      tituloPeriodo: "Reporte por Periodo",
      rangoTexto: `Del ${formatearFechaCorta(desdePersonalizado)} al ${formatearFechaCorta(hastaPersonalizado)}`,
    };
  }, [tipoReporte, fechaBase, desdePersonalizado, hastaPersonalizado, jornada, actividades]);

  const actividadesFiltradas = useMemo(() => {
    return actividades
      .filter((a) => a.fecha >= desde && a.fecha <= hasta)
      .sort(
        (a, b) =>
          a.fecha.localeCompare(b.fecha) ||
          (a.hora_inicio || "").localeCompare(b.hora_inicio || "")
      );
  }, [actividades, desde, hasta]);

  const metricas = useMemo(() => {
    let totalHoras = 0;
    let horasCompletadas = 0;

    actividadesFiltradas.forEach((a) => {
      const h = horasActividad(a, jornada);
      totalHoras += h;
      if (a.estado === "completado") horasCompletadas += h;
    });

    const metaSemanal = Number(perfil.meta_horas_semanales) || 0;

    return {
      totalActividades: actividadesFiltradas.length,
      totalHoras,
      horasCompletadas,
      metaSemanal,
    };
  }, [actividadesFiltradas, jornada, perfil.meta_horas_semanales]);

  const descargarPDF = () => {
    generarPDFReporte({
      perfil,
      colorAcento,
      tituloPeriodo,
      rangoTexto,
      jornada,
      actividades: actividadesFiltradas,
    });
  };

  const descargarCSV = () => {
    exportarCSV({
      perfil,
      tituloPeriodo,
      jornada,
      actividades: actividadesFiltradas,
    });
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
              >
                <Download size={15} />
                <span>Descargar PDF</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={descargarCSV}
                disabled={actividadesFiltradas.length === 0}
              >
                <FileSpreadsheet size={15} />
                <span>Exportar CSV (Excel)</span>
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
                      <th>Categoría</th>
                      <th>Solicitante</th>
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
                        <td style={{ whiteSpace: "nowrap" }}>
                          {act.hora_inicio} - {act.hora_fin}
                        </td>
                        <td>
                          <strong>
                            {horasActividad(act, jornada)}h
                          </strong>
                        </td>
                        <td>{act.categoria || "-"}</td>
                        <td>{act.solicitante || "-"}</td>
                        <td>{act.descripcion}</td>
                        <td>{act.entregable || "-"}</td>
                        <td>
                          <span
                            className={`badge-status ${
                              act.estado === "completado"
                                ? "badge-status-done"
                                : "badge-status-pending"
                            }`}
                          >
                            {act.estado === "completado" ? "COMPLETADO" : "PENDIENTE"}
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
            className="btn btn-primary"
            onClick={descargarPDF}
            disabled={actividadesFiltradas.length === 0}
          >
            <Download size={16} />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
