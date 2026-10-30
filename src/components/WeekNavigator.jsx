import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import MiniCalendar from "./MiniCalendar";
import {
  formatearFechaCorta,
  sumarDias,
  hoyISO,
  lunesDe,
  formatearHoras,
} from "../utils/dateUtils";

export default function WeekNavigator({
  lunesActual,
  diasVisibles,
  etiquetaJornada,
  diasLaborables,
  fechaSeleccionada,
  onCambiarLunes,
  onSeleccionarFecha,
  fechasConActividades,
  metricasSemana,
  metaHorasSemanales,
  onCambiarMetaHoras,
}) {
  const [mostrarCalendarioPopover, setMostrarCalendarioPopover] = useState(false);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [valorMetaTemp, setValorMetaTemp] = useState(metaHorasSemanales || "");
  const popoverRef = useRef(null);

  const hoy = hoyISO();
  const lunesHoy = lunesDe(hoy);

  const irSemanaAnterior = () => onCambiarLunes(sumarDias(lunesActual, -7));
  const irSemanaSiguiente = () => onCambiarLunes(sumarDias(lunesActual, 7));
  const irSemanaHoy = () => onCambiarLunes(lunesHoy);

  const esSemanaActual = lunesActual === lunesHoy;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setMostrarCalendarioPopover(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMostrarCalendarioPopover(false);
        setEditandoMeta(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const guardarMetaInline = (e) => {
    e.preventDefault();
    const num = Number(valorMetaTemp);
    if (!Number.isNaN(num) && num > 0) {
      onCambiarMetaHoras(Math.min(168, num));
    } else {
      onCambiarMetaHoras("");
    }
    setEditandoMeta(false);
  };

  const metaActiva = Number(metaHorasSemanales) || 0;
  const horasTotales = Number(metricasSemana?.horasTotales ?? metricasSemana?.totalHoras) || 0;
  const horasCompletadas = Number(metricasSemana?.horasCompletadas) || 0;
  const totalActividades = Number(metricasSemana?.totalActividades ?? metricasSemana?.cantidadActividades) || 0;
  const cantidadCompletadas = Number(metricasSemana?.cantidadCompletadas) || 0;

  const porcentajeMeta =
    metaActiva > 0
      ? Math.min(100, Math.round((horasCompletadas / metaActiva) * 100))
      : 0;
  const horasRestantes =
    metaActiva > 0 ? Math.max(0, metaActiva - horasCompletadas) : 0;

  return (
    <div className="week-navigator-bar">
      {/* Navegación de semana */}
      <div className="week-nav-left">
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={irSemanaAnterior}
            title="Semana anterior"
            aria-label="Semana anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className={`btn btn-sm ${esSemanaActual ? "btn-active-soft" : "btn-outline"}`}
            onClick={irSemanaHoy}
          >
            <span>Esta semana</span>
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={irSemanaSiguiente}
            title="Semana siguiente"
            aria-label="Semana siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Selector desplegable de fecha */}
        <div className="week-date-popover-wrap" ref={popoverRef}>
          <button
            type="button"
            className="week-date-trigger"
            onClick={() => setMostrarCalendarioPopover((v) => !v)}
            title="Seleccionar otra fecha en el calendario mensual"
          >
            <CalendarIcon size={15} className="text-accent" />
            <div className="week-date-text">
              <span className="week-label">{etiquetaJornada}</span>
              <strong>
                {formatearFechaCorta(diasVisibles[0])}
                {diasVisibles.length > 1 &&
                  ` al ${formatearFechaCorta(diasVisibles[diasVisibles.length - 1])}`}
              </strong>
            </div>
          </button>

          {mostrarCalendarioPopover && (
            <div className="calendar-popover">
              <MiniCalendar
                fechaSeleccionada={fechaSeleccionada}
                onSeleccionarFecha={(iso) => {
                  onSeleccionarFecha(iso);
                  setMostrarCalendarioPopover(false);
                }}
                fechasConActividades={fechasConActividades}
                diasLaborables={diasLaborables}
              />
            </div>
          )}
        </div>
      </div>

      {/* Progreso de horas semanales */}
      <div className="week-progress-section">
        <div className="week-progress-box">
          <div className="week-progress-header">
            <span className="progress-title">
              <Clock size={14} className="text-accent" />
              <span>
                Horas en la semana:{" "}
                <strong>{formatearHoras(horasCompletadas)}</strong>
                {metaActiva > 0 ? (
                  <>
                    {" "}
                    de <strong>{metaActiva}h</strong>
                  </>
                ) : null}
                {horasTotales > horasCompletadas ? (
                  <>
                    {" "}
                    <span className="text-muted" style={{ fontSize: "0.85em" }}>
                      ({formatearHoras(horasTotales)} registradas)
                    </span>
                  </>
                ) : null}
              </span>
            </span>

            {editandoMeta ? (
              <form onSubmit={guardarMetaInline} className="inline-meta-form">
                <label htmlFor="meta-semanal-input" className="sr-only">
                  Horas por semana
                </label>
                <input
                  id="meta-semanal-input"
                  type="number"
                  min="1"
                  max="168"
                  step="1"
                  className="meta-inline-input"
                  value={valorMetaTemp}
                  onChange={(e) => setValorMetaTemp(e.target.value)}
                  autoFocus
                />
                <span className="text-xs">h/sem</span>
                <button type="submit" className="btn btn-primary btn-xs">
                  Guardar
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="meta-edit-trigger"
                onClick={() => {
                  setValorMetaTemp(metaHorasSemanales || "");
                  setEditandoMeta(true);
                }}
              >
                <SlidersHorizontal size={12} />
                <span>
                  {metaActiva > 0
                    ? `Meta: ${metaActiva}h/sem`
                    : "Configurar horas semanales"}
                </span>
              </button>
            )}
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={porcentajeMeta}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`progress-fill ${
                metaActiva > 0 && porcentajeMeta >= 100 ? "is-complete" : ""
              }`}
              style={{ width: `${porcentajeMeta}%` }}
            />
          </div>

          <div className="week-progress-footer">
            <span>
              {metaActiva > 0
                ? horasRestantes > 0
                  ? `Restan ${formatearHoras(horasRestantes)} para completar la meta`
                  : "Meta semanal completada"
                : "Define tu meta semanal de horas"}
            </span>
            <span>
              <CheckCircle2 size={12} className="inline-icon text-green" />{" "}
              {formatearHoras(horasCompletadas)} completadas{" "}
              {totalActividades > 0 ? (
                cantidadCompletadas < totalActividades ? (
                  `(${cantidadCompletadas} de ${totalActividades} actividades)`
                ) : (
                  `(${totalActividades} ${totalActividades === 1 ? "actividad" : "actividades"})`
                )
              ) : (
                "(0 actividades)"
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
