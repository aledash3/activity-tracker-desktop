import { formatearFechaCorta, calcularHoras } from "./dateUtils";

export const exportarCSV = ({ perfil, actividades }) => {
  const configReceso = {
    activo: perfil.receso_activo !== false,
    inicio: perfil.receso_inicio || "13:00",
    fin: perfil.receso_fin || "14:00",
    minutos: perfil.receso_minutos ?? 60,
  };

  const encabezados = [
    "#",
    "Fecha",
    "Hora Inicio",
    "Hora Fin",
    "Horas",
    "Categoria",
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
    const horas = calcularHoras(a.hora_inicio, a.hora_fin, configReceso);
    return [
      i + 1,
      formatearFechaCorta(a.fecha),
      a.hora_inicio || "",
      a.hora_fin || "",
      horas,
      `"${(a.categoria || "").replace(/"/g, '""')}"`,
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
