import React from "react";
import { Plus, Clock, Utensils } from "lucide-react";
import ActivityCard from "./ActivityCard";
import {
  NOMBRES_DIAS,
  indiceDia,
  formatearDiaMes,
  hoyISO,
  formatearHoras,
} from "../utils/dateUtils";
import {
  esDiaLaborable,
  horasActividad,
  recesoParaFecha,
} from "../utils/jornada";

// Mezcla el almuerzo del dia en la lista, en su posicion horaria
const conAlmuerzo = (lista, receso) => {
  const items = lista.map((act) => ({ tipo: "actividad", act }));
  if (!receso) return items;
  const pos = items.findIndex((it) => (it.act.hora_inicio || "") >= receso.inicio);
  items.splice(pos === -1 ? items.length : pos, 0, { tipo: "almuerzo", receso });
  return items;
};

export default function WeeklyGrid({
  diasVisibles,
  actividades,
  jornada,
  onNuevaActividad,
  onEditarActividad,
  onEliminarActividad,
  onToggleEstado,
}) {
  const hoy = hoyISO();

  const dias = diasVisibles.map((fecha) => {
    const lista = actividades
      .filter((a) => a.fecha === fecha)
      .sort((a, b) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""));
    const receso = recesoParaFecha(jornada, fecha);

    return {
      fecha,
      nombre: NOMBRES_DIAS[indiceDia(fecha)],
      lista,
      items: conAlmuerzo(lista, receso),
      horasDia: lista.reduce((acc, act) => acc + horasActividad(act, jornada), 0),
      esHoy: fecha === hoy,
      noLaborable: !esDiaLaborable(fecha, jornada),
    };
  });

  return (
    <div
      className="weekly-grid-container"
      style={{ "--cols": Math.max(1, dias.length) }}
    >
      {dias.map((dia) => (
        <div
          key={dia.fecha}
          className={`day-column ${dia.esHoy ? "is-today" : ""}`}
        >
          {/* Cabecera del día */}
          <div className="day-header">
            <div className="day-title-row">
              <div className="day-name-group">
                <span className="day-name">{dia.nombre}</span>
                {dia.esHoy && <span className="today-badge">HOY</span>}
                {dia.noLaborable && (
                  <span className="off-day-badge" title="Día no laborable con registros">
                    No laborable
                  </span>
                )}
              </div>
              <span
                className={`day-hours-badge ${
                  dia.horasDia > 0 ? "has-hours" : ""
                }`}
              >
                <Clock size={12} aria-hidden="true" />
                <span>{formatearHoras(dia.horasDia)}</span>
              </span>
            </div>

            <div className="day-meta-row">
              <span className="day-date">{formatearDiaMes(dia.fecha)}</span>
              <button
                type="button"
                className="day-quick-add-icon"
                onClick={() => onNuevaActividad(dia.fecha)}
                title={`Agregar actividad el ${dia.nombre}`}
                aria-label={`Agregar actividad el ${dia.nombre}`}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Cuerpo de actividades */}
          <div className="day-activities-list">
            {dia.items.map((item) =>
              item.tipo === "almuerzo" ? (
                <div key="almuerzo" className="lunch-block">
                  <Utensils size={13} aria-hidden="true" />
                  <span className="lunch-label">Almuerzo</span>
                  <span className="lunch-time">
                    {item.receso.inicio} - {item.receso.fin}
                  </span>
                </div>
              ) : (
                <ActivityCard
                  key={item.act.id}
                  actividad={item.act}
                  jornada={jornada}
                  onEditar={onEditarActividad}
                  onEliminar={onEliminarActividad}
                  onToggleEstado={onToggleEstado}
                />
              )
            )}

            {dia.lista.length === 0 && (
              <button
                type="button"
                className="empty-day-state"
                onClick={() => onNuevaActividad(dia.fecha)}
              >
                <Plus size={18} className="empty-day-plus" />
                <span className="empty-day-title">Sin actividades</span>
                <span className="empty-day-hint">
                  Haz clic para agregar una actividad en este día
                </span>
              </button>
            )}
          </div>

          {/* Botón inferior */}
          <button
            type="button"
            className="btn-add-activity"
            onClick={() => onNuevaActividad(dia.fecha)}
          >
            <Plus size={15} />
            <span>Agregar actividad</span>
          </button>
        </div>
      ))}
    </div>
  );
}
