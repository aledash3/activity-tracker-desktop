import React from "react";
import { Plus, Clock } from "lucide-react";
import ActivityCard from "./ActivityCard";
import {
  NOMBRES_DIAS,
  sumarDias,
  formatearDiaMes,
  hoyISO,
  calcularHoras,
  formatearHoras,
} from "../utils/dateUtils";

export default function WeeklyGrid({
  lunesActual,
  actividades,
  configReceso,
  onNuevaActividad,
  onEditarActividad,
  onEliminarActividad,
  onToggleEstado,
}) {
  const hoy = hoyISO();

  const dias = NOMBRES_DIAS.map((nombre, i) => {
    const fecha = sumarDias(lunesActual, i);
    const lista = actividades
      .filter((a) => a.fecha === fecha)
      .sort((a, b) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""));

    const horasDia = lista.reduce(
      (acc, act) =>
        acc + calcularHoras(act.hora_inicio, act.hora_fin, configReceso),
      0
    );

    return {
      fecha,
      nombre,
      lista,
      horasDia,
      esHoy: fecha === hoy,
    };
  });

  return (
    <div className="weekly-grid-container">
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
            {dia.lista.length === 0 ? (
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
            ) : (
              dia.lista.map((act) => (
                <ActivityCard
                  key={act.id}
                  actividad={act}
                  configReceso={configReceso}
                  onEditar={onEditarActividad}
                  onEliminar={onEliminarActividad}
                  onToggleEstado={onToggleEstado}
                />
              ))
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
