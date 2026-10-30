import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

export default function CatalogModal({ categorias, onGuardar, onCerrar }) {
  const [lista, setLista] = useState([...categorias]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCerrar]);

  const handleAgregar = (e) => {
    e.preventDefault();
    const texto = nuevaCategoria.trim();
    if (!texto) return;
    if (lista.includes(texto)) {
      setError("Esta categoría ya está registrada.");
      return;
    }
    const nuevaLista = [...lista, texto];
    setLista(nuevaLista);
    onGuardar(nuevaLista);
    setNuevaCategoria("");
    setError("");
  };

  const handleEliminar = (index) => {
    const nuevaLista = lista.filter((_, i) => i !== index);
    setLista(nuevaLista);
    onGuardar(nuevaLista);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-modal-title"
    >
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h3 id="catalog-modal-title" className="modal-title">
              Categorías
            </h3>
            <span className="modal-subtitle">
              Administra tu lista personalizada de categorías para clasificar actividades
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
          <form onSubmit={handleAgregar} className="flex gap-2">
            <label htmlFor="nueva-cat-input" className="sr-only">
              Nombre de categoría
            </label>
            <input
              id="nueva-cat-input"
              type="text"
              className="form-input"
              value={nuevaCategoria}
              onChange={(e) => {
                setNuevaCategoria(e.target.value);
                setError("");
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
              <Plus size={16} />
              <span>Agregar</span>
            </button>
          </form>

          {error && <span className="text-red text-xs">{error}</span>}

          <div className="catalog-list">
            {lista.length === 0 ? (
              <p className="empty-catalog-note">
                No hay categorías creadas. Agrega las que necesites usando el campo superior.
              </p>
            ) : (
              lista.map((cat, idx) => (
                <div key={idx} className="catalog-item">
                  <span>{cat}</span>
                  <button
                    type="button"
                    className="catalog-delete-btn"
                    onClick={() => handleEliminar(idx)}
                    title="Eliminar categoría"
                    aria-label={`Eliminar categoría ${cat}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary btn-sm" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
