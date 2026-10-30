import { formatearFechaCorta } from "./dateUtils";
import { horasActividad } from "./jornada";
import { guardarArchivoNativo } from "./fileIo";
import { formatearSolicitantes } from "./solicitantes";

export const exportarCSV = async ({ perfil = {}, jornada, actividades = [] }) => {
  const encabezados = [
    "#",
    "Fecha",
    "Hora Inicio",
    "Hora Fin",
    "Horas",
    "Solicitante(s)",
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
    const solicitantesTexto = formatearSolicitantes(a);
    return [
      i + 1,
      formatearFechaCorta(a.fecha),
      a.hora_inicio || "",
      a.hora_fin || "",
      horas,
      `"${solicitantesTexto.replace(/"/g, '""')}"`,
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

  const nombreLimpio = (perfil.nombre || "actividades")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();

  const nombreArchivo = `actividades_${nombreLimpio}_${new Date().toISOString().slice(0, 10)}.csv`;

  const blob = new Blob(["\uFEFF" + contenido], {
    type: "text/csv;charset=utf-8;",
  });

  return await guardarArchivoNativo({
    nombreSugerido: nombreArchivo,
    contenido: blob,
    mimeType: "text/csv;charset=utf-8",
    extension: "csv",
    descripcionFiltro: "Archivo CSV delimitado por comas / punto y coma",
  });
};
