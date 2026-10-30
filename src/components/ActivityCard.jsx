import React from "react";
import {
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import {
  calcularHoras,
  formatearHoras,
} from "../utils/dateUtils";

export default function ActivityCard({
  actividad,
  configReceso,
  onEditar,
  onEliminar,
  onToggleEstado,
}) {
  const horas = calcularHoras(
    actividad.hora_inicio,
    actividad.hora_fin,
    configReceso
  );
  const esCompletado = actividad.estado === "completado";

  return (
    <article className={`activity-card ${esCompletado ? "is-done" : "is-pending"}`}>
      {/* Fila superior: Horario y duración */}
      <div className="activity-card-top">
        <div className="activity-time">
          <Clock size={13} aria-hidden="true" />
          <span>
            {actividad.hora_inicio || "--:--"} - {actividad.hora_fin || "--:--"}
          </span>
        </div>

        <span className="activity-hours-pill">
          {formatearHoras(horas)}
        </span>
      </div>

      {/* Categoría */}
      {actividad.categoria && (
        <div className="activity-category-tag">
          {actividad.categoria}
        </div>
      )}

      {/* Descripción principal */}
      <p className="activity-description">
        {actividad.descripcion}
      </p>

      {/* Entregable o avance */}
      {actividad.entregable && (
        <div className="activity-deliverable">
          <strong>Entregable:</strong> {actividad.entregable}
        </div>
      )}

      {/* Pie: Estado y Acciones */}
      <div className="activity-card-bottom">
        <button
          type="button"
          className={`badge-status ${
            esCompletado ? "badge-status-done" : "badge-status-pending"
          }`}
          onClick={() =>
            onToggleEstado(
              actividad.id,
              esCompletado ? "pendiente" : "completado"
            )
          }
        >
          {esCompletado ? (
            <>
              <CheckCircle2 size={13} />
              <span>Completado</span>
            </>
          ) : (
            <>
              <Clock3 size={13} />
              <span>Pendiente</span>
            </>
          )}
        </button>

        <div className="activity-actions">
          <button
            type="button"
            className="action-btn edit-btn"
            onClick={() => onEditar(actividad)}
            title="Editar actividad"
            aria-label="Editar actividad"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="action-btn delete-btn"
            onClick={() => onEliminar(actividad.id)}
            title="Eliminar actividad"
            aria-label="Eliminar actividad"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
