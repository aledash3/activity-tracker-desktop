import React, { useEffect } from "react";
import { X, Sun, Moon, RotateCcw, Check } from "lucide-react";
import {
  PALETAS_COLOR,
  OPCIONES_CALIGRAFIA,
  APARIENCIA_DEFAULT,
} from "../utils/storage";

export default function AppearanceModal({
  apariencia,
  onCambiarApariencia,
  onCerrar,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCerrar]);

  const actualizar = (cambios) => {
    onCambiarApariencia({ ...apariencia, ...cambios });
  };

  const restaurarDefecto = () => {
    onCambiarApariencia({ ...APARIENCIA_DEFAULT });
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="appearance-modal-title"
    >
      <div className="modal-box modal-medium">
        <div className="modal-header">
          <div>
            <h3 id="appearance-modal-title" className="modal-title">
              Personalización Visual y Caligrafía
            </h3>
            <span className="modal-subtitle">
              Ajusta la paleta de colores, estilo tipográfico y apariencia de la interfaz
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

        <div className="modal-form">
          {/* 1. Modo Claro / Oscuro */}
          <div className="form-group">
            <span className="form-label">Tema de la interfaz</span>
            <div className="grid-2">
              <button
                type="button"
                className={`theme-choice-card ${
                  apariencia.tema === "light" ? "selected" : ""
                }`}
                onClick={() => actualizar({ tema: "light" })}
              >
                <Sun size={18} />
                <span>Modo Claro</span>
              </button>
              <button
                type="button"
                className={`theme-choice-card ${
                  apariencia.tema === "dark" ? "selected" : ""
                }`}
                onClick={() => actualizar({ tema: "dark" })}
              >
                <Moon size={18} />
                <span>Modo Oscuro</span>
              </button>
            </div>
          </div>

          {/* 2. Paleta de Colores */}
          <div className="form-group">
            <div className="flex justify-between items-center">
              <span className="form-label">Color de acento</span>
              <div className="custom-color-picker-wrap">
                <label htmlFor="custom-color-input" className="input-sublabel" style={{ marginBottom: 0 }}>
                  Personalizado:
                </label>
                <input
                  id="custom-color-input"
                  type="color"
                  className="color-picker-native"
                  value={apariencia.colorAcento || "#2563eb"}
                  onChange={(e) => actualizar({ colorAcento: e.target.value })}
                />
                <span className="color-hex-code">{apariencia.colorAcento}</span>
              </div>
            </div>

            <div className="color-swatches-grid">
              {PALETAS_COLOR.map((paleta) => {
                const activo =
                  (apariencia.colorAcento || "").toLowerCase() ===
                  paleta.hex.toLowerCase();
                return (
                  <button
                    key={paleta.id}
                    type="button"
                    className={`color-swatch-btn ${activo ? "active" : ""}`}
                    onClick={() => actualizar({ colorAcento: paleta.hex })}
                  >
                    <span
                      className="swatch-circle"
                      style={{ backgroundColor: paleta.hex }}
                    >
                      {activo && <Check size={12} color="#ffffff" />}
                    </span>
                    <span className="swatch-name">{paleta.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Caligrafía y Tipografía */}
          <div className="form-group">
            <span className="form-label">Caligrafía y fuente tipográfica</span>
            <div className="font-options-grid">
              {OPCIONES_CALIGRAFIA.map((font) => {
                const activo = apariencia.fuente === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    className={`font-option-card ${activo ? "selected" : ""}`}
                    style={{ fontFamily: font.css }}
                    onClick={() => actualizar({ fuente: font.id })}
                  >
                    <span className="font-sample-title">{font.nombre}</span>
                    <span className="font-sample-meta">{font.categoria}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Tamaño de letra y Bordes */}
          <div className="grid-2">
            <div className="form-group">
              <span className="form-label">Tamaño de texto</span>
              <div className="segmented-control">
                {[
                  { id: "compacto", label: "Compacto" },
                  { id: "normal", label: "Normal" },
                  { id: "grande", label: "Grande" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`segment-btn ${
                      apariencia.tamanoFuente === opt.id ? "active" : ""
                    }`}
                    onClick={() => actualizar({ tamanoFuente: opt.id })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <span className="form-label">Estilo de esquinas</span>
              <div className="segmented-control">
                {[
                  { id: "recto", label: "Recto" },
                  { id: "suave", label: "Suave" },
                  { id: "redondeado", label: "Redondeado" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`segment-btn ${
                      apariencia.bordes === opt.id ? "active" : ""
                    }`}
                    onClick={() => actualizar({ bordes: opt.id })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={restaurarDefecto}
          >
            <RotateCcw size={14} />
            <span>Restaurar valores iniciales</span>
          </button>

          <button type="button" className="btn btn-primary" onClick={onCerrar}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
