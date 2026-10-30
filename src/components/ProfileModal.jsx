import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { aMinutos } from "../utils/dateUtils";

export default function ProfileModal({ perfil, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    ...perfil,
    receso_activo: perfil.receso_activo !== false,
    receso_inicio: perfil.receso_inicio || "13:00",
    receso_fin: perfil.receso_fin || "14:00",
    receso_minutos: perfil.receso_minutos ?? 60,
  });
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCerrar]);

  const handleCambioPeriodoReceso = (campo, valor) => {
    const actualizado = { ...form, [campo]: valor };
    const ini = aMinutos(actualizado.receso_inicio);
    const fin = aMinutos(actualizado.receso_fin);
    if (fin > ini) {
      actualizado.receso_minutos = fin - ini;
    }
    setForm(actualizado);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const metaNum = Number(form.meta_horas_semanales);
    const minutosReceso = Math.max(0, Number(form.receso_minutos) || 0);

    onGuardar({
      ...form,
      meta_horas_semanales: !Number.isNaN(metaNum) && metaNum > 0 ? metaNum : "",
      receso_minutos: minutosReceso,
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

            {/* Configuración implícita del periodo y tiempo de receso */}
            <div className="recess-config-box">
              <label className="checkbox-inline-label">
                <input
                  type="checkbox"
                  checked={form.receso_activo}
                  onChange={(e) =>
                    setForm({ ...form, receso_activo: e.target.checked })
                  }
                />
                <span>Descontar automáticamente periodo de receso diario</span>
              </label>

              {form.receso_activo && (
                <div className="grid-3" style={{ marginTop: 10 }}>
                  <div>
                    <label htmlFor="receso-ini" className="input-sublabel">
                      Desde
                    </label>
                    <input
                      id="receso-ini"
                      type="time"
                      className="form-input form-input-sm"
                      value={form.receso_inicio}
                      onChange={(e) =>
                        handleCambioPeriodoReceso("receso_inicio", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="receso-fin" className="input-sublabel">
                      Hasta
                    </label>
                    <input
                      id="receso-fin"
                      type="time"
                      className="form-input form-input-sm"
                      value={form.receso_fin}
                      onChange={(e) =>
                        handleCambioPeriodoReceso("receso_fin", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="receso-min" className="input-sublabel">
                      Tiempo (min)
                    </label>
                    <input
                      id="receso-min"
                      type="number"
                      min="0"
                      max="240"
                      step="5"
                      className="form-input form-input-sm"
                      value={form.receso_minutos}
                      onChange={(e) =>
                        setForm({ ...form, receso_minutos: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
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
