import React, { useState, useEffect } from "react";
import { X, Clock, CheckCircle2, AlertCircle, Utensils, UserPlus, UserCheck } from "lucide-react";
import {
  formatearFechaTexto,
  calcularHoras,
  formatearHoras,
  aMinutos,
  hoyISO,
  indiceDia,
  NOMBRES_DIAS,
} from "../utils/dateUtils";
import { esDiaLaborable, recesoParaFecha } from "../utils/jornada";
import { normalizarSolicitantes, formatearSolicitantes } from "../utils/solicitantes";

export default function ActivityModal({
  actividadEditando,
  fechaPredeterminada,
  solicitantes = [],
  jornada,
  onGuardar,
  onCerrar,
}) {
  const [form, setForm] = useState(() => ({
    fecha: actividadEditando?.fecha || fechaPredeterminada || hoyISO(),
    hora_inicio: actividadEditando?.hora_inicio || "",
    hora_fin: actividadEditando?.hora_fin || "",
    estado: actividadEditando?.estado || "completado",
    descripcion: actividadEditando?.descripcion || "",
    entregable: actividadEditando?.entregable || "",
  }));

  const [solicitantesSeleccionados, setSolicitantesSeleccionados] = useState(() =>
    normalizarSolicitantes(actividadEditando)
  );
  const [nuevoSolicitanteTexto, setNuevoSolicitanteTexto] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (actividadEditando) {
      setForm({
        fecha: actividadEditando.fecha || hoyISO(),
        hora_inicio: actividadEditando.hora_inicio || "",
        hora_fin: actividadEditando.hora_fin || "",
        estado: actividadEditando.estado || "completado",
        descripcion: actividadEditando.descripcion || "",
        entregable: actividadEditando.entregable || "",
      });
      setSolicitantesSeleccionados(normalizarSolicitantes(actividadEditando));
    } else {
      setForm({
        fecha: fechaPredeterminada || hoyISO(),
        hora_inicio: "",
        hora_fin: "",
        estado: "completado",
        descripcion: "",
        entregable: "",
      });
      setSolicitantesSeleccionados([]);
    }
    setNuevoSolicitanteTexto("");
    setError("");
  }, [actividadEditando, fechaPredeterminada]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCerrar]);

  const receso = form.fecha ? recesoParaFecha(jornada, form.fecha) : null;
  const horasEfectivas = calcularHoras(form.hora_inicio, form.hora_fin, receso);

  const agregarSolicitante = (nombre) => {
    const limpio = (nombre || "").trim();
    if (!limpio) return;
    if (!solicitantesSeleccionados.some((s) => s.toLowerCase() === limpio.toLowerCase())) {
      setSolicitantesSeleccionados([...solicitantesSeleccionados, limpio]);
    }
    setNuevoSolicitanteTexto("");
  };

  const removerSolicitante = (indice) => {
    setSolicitantesSeleccionados(
      solicitantesSeleccionados.filter((_, idx) => idx !== indice)
    );
  };

  const handleKeyDownSolicitante = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarSolicitante(nuevoSolicitanteTexto);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fecha) {
      setError("Selecciona la fecha de la actividad.");
      return;
    }
    const cambioFecha = !actividadEditando || actividadEditando.fecha !== form.fecha;
    if (cambioFecha && !esDiaLaborable(form.fecha, jornada)) {
      setError(
        `El ${NOMBRES_DIAS[indiceDia(form.fecha)].toLowerCase()} no está marcado como laborable. Actívalo en Configuración o elige otra fecha.`
      );
      return;
    }
    if (!form.hora_inicio || !form.hora_fin) {
      setError("Ingresa la hora de inicio y la hora de fin.");
      return;
    }
    if (aMinutos(form.hora_fin) <= aMinutos(form.hora_inicio)) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }
    if (horasEfectivas <= 0) {
      setError(
        receso
          ? `Ese horario cae dentro del almuerzo (${receso.inicio} a ${receso.fin}) y no suma horas. Elige otro horario.`
          : "La duración de la actividad debe ser mayor a 0 minutos."
      );
      return;
    }
    if (!form.descripcion.trim()) {
      setError("Ingresa la descripción de la actividad.");
      return;
    }

    // Incluir solicitante si quedó texto sin pulsar botón
    const listaFinal = [...solicitantesSeleccionados];
    const pendienteTexto = nuevoSolicitanteTexto.trim();
    if (pendienteTexto && !listaFinal.some((s) => s.toLowerCase() === pendienteTexto.toLowerCase())) {
      listaFinal.push(pendienteTexto);
    }

    onGuardar({
      ...form,
      solicitantes: listaFinal,
      solicitante: listaFinal.join(", "),
      descripcion: form.descripcion.trim(),
      entregable: form.entregable.trim(),
      id: actividadEditando ? actividadEditando.id : `act-${Date.now()}`,
    });
  };

  // Sugerencias no agregadas aún
  const sugerenciasDisponibles = (solicitantes || []).filter(
    (s) =>
      Boolean(s) &&
      !solicitantesSeleccionados.some((sel) => sel.toLowerCase() === s.toLowerCase())
  );

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-modal-title"
    >
      <div className="modal-box">
        {/* Encabezado */}
        <div className="modal-header">
          <div>
            <h3 id="activity-modal-title" className="modal-title">
              {actividadEditando ? "Editar Actividad" : "Agregar Actividad"}
            </h3>
            <span className="modal-subtitle">
              {form.fecha ? formatearFechaTexto(form.fecha) : ""}
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

        {error && (
          <div className="alert-box alert-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form-shell" noValidate>
          <div className="modal-form">
            {/* 1. Fecha y Entregable */}
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="act-fecha" className="form-label">
                  Fecha
                </label>
                <input
                  id="act-fecha"
                  type="date"
                  className="form-input"
                  value={form.fecha}
                  onChange={(e) => {
                    setError("");
                    setForm({ ...form, fecha: e.target.value });
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="act-entregable" className="form-label">
                  Entregable / Avance (Opcional)
                </label>
                <input
                  id="act-entregable"
                  type="text"
                  placeholder="Ej: Informe preliminar, commit GitHub, enlace..."
                  className="form-input"
                  value={form.entregable}
                  onChange={(e) => setForm({ ...form, entregable: e.target.value })}
                />
              </div>
            </div>

            {/* 2. Horario */}
            <div className="form-group">
              <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
                <span className="form-label" style={{ marginBottom: 0 }}>
                  Horario
                </span>
                {horasEfectivas > 0 && (
                  <span className="hours-preview-badge">
                    <Clock size={12} />
                    <span>Duración: {formatearHoras(horasEfectivas)}</span>
                  </span>
                )}
              </div>

              <div className="grid-2">
                <div>
                  <label htmlFor="act-hora-inicio" className="input-sublabel">
                    Hora de inicio
                  </label>
                  <input
                    id="act-hora-inicio"
                    type="time"
                    className="form-input"
                    value={form.hora_inicio}
                    onChange={(e) => {
                      setError("");
                      setForm({ ...form, hora_inicio: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="act-hora-fin" className="input-sublabel">
                    Hora de fin
                  </label>
                  <input
                    id="act-hora-fin"
                    type="time"
                    className="form-input"
                    value={form.hora_fin}
                    onChange={(e) => {
                      setError("");
                      setForm({ ...form, hora_fin: e.target.value });
                    }}
                  />
                </div>
              </div>
              {receso && (
                <p className="form-hint lunch-hint">
                  <Utensils size={12} className="inline-icon" /> Almuerzo ese día:{" "}
                  {receso.inicio} a {receso.fin}. Se descuenta automáticamente.
                </p>
              )}
            </div>

            {/* 3. Descripción */}
            <div className="form-group">
              <label htmlFor="act-descripcion" className="form-label">
                Descripción de la actividad
              </label>
              <textarea
                id="act-descripcion"
                className="form-textarea"
                rows={3}
                placeholder="Describe la tarea o actividad realizada..."
                value={form.descripcion}
                onChange={(e) => {
                  setError("");
                  setForm({ ...form, descripcion: e.target.value });
                }}
              />
            </div>

            {/* 4. Solicitantes (Soporte múltiple) */}
            <div className="form-group">
              <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
                <label htmlFor="act-solicitante-input" className="form-label" style={{ marginBottom: 0 }}>
                  Solicitante(s) de la actividad
                </label>
                {solicitantesSeleccionados.length > 0 && (
                  <span className="text-xs text-muted">
                    {solicitantesSeleccionados.length}{" "}
                    {solicitantesSeleccionados.length === 1 ? "asignado" : "asignados"}
                  </span>
                )}
              </div>

              {/* Lista de chips de solicitantes seleccionados */}
              {solicitantesSeleccionados.length > 0 && (
                <div className="requester-chip-group">
                  {solicitantesSeleccionados.map((sol, idx) => (
                    <span key={idx} className="requester-chip">
                      <UserCheck size={12} className="text-accent" />
                      <span>{sol}</span>
                      <button
                        type="button"
                        className="requester-chip-remove"
                        onClick={() => removerSolicitante(idx)}
                        title={`Quitar ${sol}`}
                        aria-label={`Quitar ${sol}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input para agregar nuevo solicitante */}
              <div className="requester-input-row">
                <input
                  id="act-solicitante-input"
                  type="text"
                  list="lista-solicitantes-modal"
                  placeholder="Escribe el nombre del solicitante y pulsa Añadir o Enter..."
                  className="form-input"
                  value={nuevoSolicitanteTexto}
                  onChange={(e) => setNuevoSolicitanteTexto(e.target.value)}
                  onKeyDown={handleKeyDownSolicitante}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-sm requester-add-btn"
                  onClick={() => agregarSolicitante(nuevoSolicitanteTexto)}
                  disabled={!nuevoSolicitanteTexto.trim()}
                >
                  <UserPlus size={14} />
                  <span>Añadir</span>
                </button>
              </div>

              {sugerenciasDisponibles.length > 0 && (
                <datalist id="lista-solicitantes-modal">
                  {sugerenciasDisponibles.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              )}

              {/* Sugerencias rápidas clicables */}
              {sugerenciasDisponibles.length > 0 && (
                <div className="requester-quick-suggs">
                  <span className="text-xs text-muted" style={{ marginRight: 6 }}>
                    Sugerencias:
                  </span>
                  <div className="requester-quick-list">
                    {sugerenciasDisponibles.slice(0, 5).map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="requester-quick-btn"
                        onClick={() => agregarSolicitante(s)}
                        title={`Añadir ${s}`}
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Estado */}
            <div className="form-group">
              <span className="form-label">Estado</span>
              <div className="status-selector-2">
                <button
                  type="button"
                  className={`status-btn-choice done ${
                    form.estado === "completado" ? "selected" : ""
                  }`}
                  onClick={() => setForm({ ...form, estado: "completado" })}
                >
                  <CheckCircle2 size={16} />
                  <span>Completado</span>
                </button>
                <button
                  type="button"
                  className={`status-btn-choice pending ${
                    form.estado === "pendiente" ? "selected" : ""
                  }`}
                  onClick={() => setForm({ ...form, estado: "pendiente" })}
                >
                  <Clock size={16} />
                  <span>Pendiente</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pie del modal */}
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {actividadEditando ? "Guardar cambios" : "Agregar actividad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
