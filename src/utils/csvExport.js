import { formatearFechaCorta } from "./dateUtils";
import { horasActividad } from "./jornada";

export const exportarCSV = ({ perfil, jornada, actividades }) => {
  const encabezados = [
    "#",
    "Fecha",
    "Hora Inicio",
    "Hora Fin",
    "Horas",
    "Categoria",
    "Solicitante",
    "Estado",
    "Descripcion de Actividad",
    "Entregable / Avance",
    "Nombre",
    "Identificacion",
    "Lugar de Trabajo / Institucion",
    "Grupo / Unidad",
    "Cargo",
  ];

  const filas = actividades.map((a, i) => {
    const horas = horasActividad(a, jornada);
    return [
      i + 1,
      formatearFechaCorta(a.fecha),
      a.hora_inicio || "",
      a.hora_fin || "",
      horas,
      `"${(a.categoria || "").replace(/"/g, '""')}"`,
      `"${(a.solicitante || "").replace(/"/g, '""')}"`,
      (a.estado || "completado").toUpperCase(),
      `"${(a.descripcion || "").replace(/"/g, '""')}"`,
      `"${(a.entregable || "").replace(/"/g, '""')}"`,
      `"${(perfil.nombre || "").replace(/"/g, '""')}"`,
      `"${(perfil.identificacion || "").replace(/"/g, '""')}"`,
      `"${(perfil.institucion || "").replace(/"/g, '""')}"`,
      `"${(perfil.unidad_grupo || "").replace(/"/g, '""')}"`,
      `"${(perfil.cargo || "").replace(/"/g, '""')}"`,
    ];
  });

  const contenido = [
    encabezados.join(";"),
    ...filas.map((fila) => fila.join(";")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + contenido], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const nombreLimpio = (perfil.nombre || "actividades")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();
  a.download = `actividades_${nombreLimpio}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
