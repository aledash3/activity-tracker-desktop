import React, { useState, useEffect } from "react";
import { X, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import {
  formatearFechaTexto,
  calcularHoras,
  formatearHoras,
  esFinDeSemana,
  aMinutos,
  hoyISO,
} from "../utils/dateUtils";

export default function ActivityModal({
  actividadEditando,
  fechaPredeterminada,
  categorias,
  configReceso,
  onGuardar,
  onCerrar,
}) {
  const [form, setForm] = useState(() => ({
    fecha: actividadEditando?.fecha || fechaPredeterminada || hoyISO(),
    hora_inicio: actividadEditando?.hora_inicio || "",
    hora_fin: actividadEditando?.hora_fin || "",
    categoria: actividadEditando?.categoria || "",
    estado: actividadEditando?.estado || "completado",
    descripcion: actividadEditando?.descripcion || "",
    entregable: actividadEditando?.entregable || "",
  }));

  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCerrar]);

  const horasEfectivas = calcularHoras(
    form.hora_inicio,
    form.hora_fin,
    configReceso
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fecha) {
      setError("Selecciona la fecha de la actividad.");
      return;
    }
    if (esFinDeSemana(form.fecha)) {
      setError("Solo se permiten registros de lunes a viernes.");
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
      setError("La duración de la actividad debe ser mayor a 0 minutos.");
      return;
    }
    if (!form.descripcion.trim()) {
      setError("Ingresa la descripción de la actividad.");
      return;
    }

    onGuardar({
      ...form,
      categoria: form.categoria.trim(),
      descripcion: form.descripcion.trim(),
      entregable: form.entregable.trim(),
      id: actividadEditando ? actividadEditando.id : `act-${Date.now()}`,
    });
  };

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
            {/* 1. Fecha y Categoría */}
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
                <label htmlFor="act-categoria" className="form-label">
                  Categoría (Opcional)
                </label>
                <input
                  id="act-categoria"
                  type="text"
                  list="lista-categorias-modal"
                  className="form-input"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                />
                {categorias.length > 0 && (
                  <datalist id="lista-categorias-modal">
                    {categorias.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>
                )}
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
                value={form.descripcion}
                onChange={(e) => {
                  setError("");
                  setForm({ ...form, descripcion: e.target.value });
                }}
              />
            </div>

            {/* 4. Entregable y Estado */}
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="act-entregable" className="form-label">
                  Entregable / Avance (Opcional)
                </label>
                <input
                  id="act-entregable"
                  type="text"
                  className="form-input"
                  value={form.entregable}
                  onChange={(e) => setForm({ ...form, entregable: e.target.value })}
                />
              </div>

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
                    <CheckCircle2 size={15} />
                    <span>Completado</span>
                  </button>
                  <button
                    type="button"
                    className={`status-btn-choice pending ${
                      form.estado === "pendiente" ? "selected" : ""
                    }`}
                    onClick={() => setForm({ ...form, estado: "pendiente" })}
                  >
                    <Clock size={15} />
                    <span>Pendiente</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {actividadEditando ? "Guardar cambios" : "Guardar actividad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
