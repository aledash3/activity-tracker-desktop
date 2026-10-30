import React, { useState, useEffect } from "react";
import { X, Check, Plus, Trash2, AlertCircle, Utensils } from "lucide-react";
import DayPicker from "./DayPicker";
import { aMinutos, NOMBRES_DIAS } from "../utils/dateUtils";
import { DIAS_LABORABLES_DEFAULT, recesoEsValido } from "../utils/jornada";

export default function ProfileModal({ perfil, onGuardar, onCerrar }) {
  const [form, setForm] = useState(() => ({
    ...perfil,
    dias_laborables: perfil.dias_laborables?.length
      ? perfil.dias_laborables
      : DIAS_LABORABLES_DEFAULT,
    recesos: (perfil.recesos || []).map((r) => ({ ...r })),
  }));
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCerrar]);

  const actualizarReceso = (id, cambios) => {
    setError("");
    setForm((prev) => ({
      ...prev,
      recesos: prev.recesos.map((r) => {
        if (r.id !== id) return r;
        const actualizado = { ...r, ...cambios };
        // Al cambiar el periodo, el tiempo descontado se ajusta a su duracion
        if ("inicio" in cambios || "fin" in cambios) {
          const dur = aMinutos(actualizado.fin) - aMinutos(actualizado.inicio);
          if (actualizado.inicio && actualizado.fin && dur > 0) actualizado.minutos = dur;
        }
        return actualizado;
      }),
    }));
  };

  const agregarReceso = () => {
    setError("");
    setForm((prev) => {
      const cubiertos = new Set(prev.recesos.flatMap((r) => r.dias));
      return {
        ...prev,
        recesos: [
          ...prev.recesos,
          {
            id: `almuerzo-${Date.now()}`,
            dias: prev.dias_laborables.filter((d) => !cubiertos.has(d)),
            inicio: "",
            fin: "",
            minutos: "",
          },
        ],
      };
    });
  };

  const quitarReceso = (id) => {
    setError("");
    setForm((prev) => ({ ...prev, recesos: prev.recesos.filter((r) => r.id !== id) }));
  };

  const validarRecesos = () => {
    const usados = new Map();
    for (const [i, r] of form.recesos.entries()) {
      const nombre = `Almuerzo ${i + 1}`;
      if (r.dias.length === 0) return `${nombre}: selecciona al menos un día.`;
      if (!recesoEsValido(r)) {
        return `${nombre}: completa "Desde" y "Hasta" con una hora de fin posterior al inicio.`;
      }
      for (const d of r.dias) {
        if (usados.has(d)) {
          return `El ${NOMBRES_DIAS[d].toLowerCase()} está en dos horarios de almuerzo distintos. Deja cada día en uno solo.`;
        }
        usados.set(d, i);
      }
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.dias_laborables.length === 0) {
      setError("Marca al menos un día laborable.");
      return;
    }
    const errorReceso = validarRecesos();
    if (errorReceso) {
      setError(errorReceso);
      return;
    }

    const metaNum = Number(form.meta_horas_semanales);
    onGuardar({
      ...form,
      meta_horas_semanales: !Number.isNaN(metaNum) && metaNum > 0 ? metaNum : "",
      recesos: form.recesos.map((r) => ({
        ...r,
        minutos: Math.max(0, Number(r.minutos) || 0),
      })),
    });
    setGuardado(true);
    setTimeout(() => {
      setGuardado(false);
      onCerrar();
    }, 350);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h3 id="profile-modal-title" className="modal-title">
              Configuración Laboral y Horaria
            </h3>
            <span className="modal-subtitle">
              Datos del lugar de trabajo, cargo, meta semanal y parámetros de horario
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

        <form onSubmit={handleSubmit} className="modal-form-shell">
          <div className="modal-form">
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="perfil-nombre" className="form-label">
                  Nombre completo
                </label>
                <input
                  id="perfil-nombre"
                  type="text"
                  className="form-input"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="perfil-id" className="form-label">
                  Identificación / Cédula
                </label>
                <input
                  id="perfil-id"
                  type="text"
                  className="form-input"
                  value={form.identificacion}
                  onChange={(e) =>
                    setForm({ ...form, identificacion: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="perfil-institucion" className="form-label">
                  Lugar de trabajo / Institución
                </label>
                <input
                  id="perfil-institucion"
                  type="text"
                  className="form-input"
                  value={form.institucion}
                  onChange={(e) =>
                    setForm({ ...form, institucion: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="perfil-unidad" className="form-label">
                  Grupo / Departamento / Proyecto
                </label>
                <input
                  id="perfil-unidad"
                  type="text"
                  className="form-input"
                  value={form.unidad_grupo}
                  onChange={(e) =>
                    setForm({ ...form, unidad_grupo: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="perfil-cargo" className="form-label">
                  Cargo / Rol actual
                </label>
                <input
                  id="perfil-cargo"
                  type="text"
                  className="form-input"
                  value={form.cargo}
                  onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="perfil-meta" className="form-label">
                  Horas a cumplir en la semana
                </label>
                <input
                  id="perfil-meta"
                  type="number"
                  min="1"
                  max="168"
                  step="1"
                  className="form-input"
                  value={form.meta_horas_semanales}
                  onChange={(e) =>
                    setForm({ ...form, meta_horas_semanales: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="perfil-supervisor" className="form-label">
                Supervisor / Coordinador (Opcional para firma en reportes)
              </label>
              <input
                id="perfil-supervisor"
                type="text"
                className="form-input"
                value={form.supervisor}
                onChange={(e) => setForm({ ...form, supervisor: e.target.value })}
              />
            </div>

            <div className="recess-config-box">
              <span className="form-label">Días laborables</span>
              <DayPicker
                ariaLabel="Días laborables"
                value={form.dias_laborables}
                onChange={(dias) => {
                  setError("");
                  setForm({ ...form, dias_laborables: dias });
                }}
              />
              <p className="form-hint">
                Solo estos días aparecen en el calendario semanal.
              </p>
            </div>

            <div className="recess-config-box">
              <div className="flex justify-between items-center">
                <span className="form-label" style={{ marginBottom: 0 }}>
                  <Utensils size={13} className="inline-icon" /> Horarios de almuerzo
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={agregarReceso}
                >
                  <Plus size={13} />
                  <span>Agregar horario</span>
                </button>
              </div>
              <p className="form-hint">
                Aparece automáticamente en el calendario y se descuenta de las horas. Puedes definir un horario distinto por grupo de días.
              </p>

              {form.recesos.map((r, i) => (
                <div key={r.id} className="recess-rule">
                  <div className="recess-rule-head">
                    <span className="input-sublabel">Almuerzo {i + 1}</span>
                    <button
                      type="button"
                      className="action-btn delete-btn"
                      onClick={() => quitarReceso(r.id)}
                      title="Quitar este horario"
                      aria-label={`Quitar almuerzo ${i + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <DayPicker
                    ariaLabel={`Días del almuerzo ${i + 1}`}
                    value={r.dias}
                    onChange={(dias) => actualizarReceso(r.id, { dias })}
                  />
                  <div className="grid-3" style={{ marginTop: 8 }}>
                    <div>
                      <label htmlFor={`receso-ini-${r.id}`} className="input-sublabel">
                        Desde
                      </label>
                      <input
                        id={`receso-ini-${r.id}`}
                        type="time"
                        className="form-input form-input-sm"
                        value={r.inicio}
                        onChange={(e) => actualizarReceso(r.id, { inicio: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor={`receso-fin-${r.id}`} className="input-sublabel">
                        Hasta
                      </label>
                      <input
                        id={`receso-fin-${r.id}`}
                        type="time"
                        className="form-input form-input-sm"
                        value={r.fin}
                        onChange={(e) => actualizarReceso(r.id, { fin: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor={`receso-min-${r.id}`} className="input-sublabel">
                        Tiempo (min)
                      </label>
                      <input
                        id={`receso-min-${r.id}`}
                        type="number"
                        min="0"
                        max="240"
                        step="5"
                        className="form-input form-input-sm"
                        value={r.minutos}
                        onChange={(e) => actualizarReceso(r.id, { minutos: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="alert-box alert-error" role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {guardado ? (
                <>
                  <Check size={16} />
                  <span>Guardado</span>
                </>
              ) : (
                "Guardar configuración"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
