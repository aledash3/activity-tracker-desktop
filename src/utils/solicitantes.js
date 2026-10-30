/**
 * Utilidades para la gestión de múltiples solicitantes en actividades.
 * Admite retrocompatibilidad con cadenas individuales ("Ing. Juan Perez"),
 * cadenas separadas por coma ("Ing. Navas, Ing. Vallejo") y arreglos de solicitantes.
 */

export const normalizarSolicitantes = (valor) => {
  if (!valor) return [];

  if (Array.isArray(valor)) {
    return valor
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof valor === "object") {
    if (Array.isArray(valor.solicitantes) && valor.solicitantes.length > 0) {
      return normalizarSolicitantes(valor.solicitantes);
    }
    if (typeof valor.solicitante === "string") {
      return normalizarSolicitantes(valor.solicitante);
    }
    return [];
  }

  if (typeof valor === "string") {
    return valor
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
};

export const formatearSolicitantes = (actividadOValor) => {
  const lista = normalizarSolicitantes(actividadOValor);
  return lista.join(", ");
};
