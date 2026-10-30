import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatearFechaCorta, formatearFechaTexto } from "./dateUtils";
import { horasActividad } from "./jornada";
import { guardarArchivoNativo } from "./fileIo";
import { formatearSolicitantes } from "./solicitantes";

const hexToRgb = (hex) => {
  const clean = (hex || "#2563eb").replace("#", "");
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return [37, 99, 235];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

export const generarPDFReporte = async ({
  perfil = {},
  colorAcento,
  tituloPeriodo,
  rangoTexto,
  jornada,
  actividades = [],
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = hexToRgb(colorAcento);
  const darkSlate = [15, 23, 42];
  const lightBg = [248, 250, 252];
  const grayBorder = [203, 213, 225];

  // 1. Encabezado
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 24, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    (perfil.institucion || "INFORME DE REGISTRO DE ACTIVIDADES").toUpperCase(),
    105,
    10.5,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(241, 245, 249);
  doc.text(
    perfil.unidad_grupo || "Bitácora de Actividades y Control de Horas",
    105,
    17.5,
    { align: "center" }
  );

  // 2. Título del Reporte y Fecha de emisión
  let y = 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...darkSlate);
  doc.text("REPORTE DE ACTIVIDADES", 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const fechaEmision = `Emitido: ${formatearFechaTexto(new Date().toISOString().slice(0, 10))}`;
  doc.text(fechaEmision, 196, y, { align: "right" });

  y += 5;

  // 3. Ficha de Datos
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...grayBorder);
  doc.roundedRect(14, y, 182, 26, 1.5, 1.5, "FD");

  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);

  // Columna Izquierda
  doc.setFont("helvetica", "bold");
  doc.text("Nombre:", 18, y + 6.5);
  doc.setFont("helvetica", "normal");
  doc.text(perfil.nombre || "-", 48, y + 6.5);

  doc.setFont("helvetica", "bold");
  doc.text("Identificación:", 18, y + 13.5);
  doc.setFont("helvetica", "normal");
  doc.text(perfil.identificacion || "-", 48, y + 13.5);

  doc.setFont("helvetica", "bold");
  doc.text("Cargo / Rol:", 18, y + 20.5);
  doc.setFont("helvetica", "normal");
  doc.text(perfil.cargo || "-", 48, y + 20.5);

  // Columna Derecha
  doc.setFont("helvetica", "bold");
  doc.text("Lugar / Unidad:", 112, y + 6.5);
  doc.setFont("helvetica", "normal");
  doc.text(perfil.unidad_grupo || perfil.institucion || "-", 140, y + 6.5);

  doc.setFont("helvetica", "bold");
  doc.text("Periodo:", 112, y + 13.5);
  doc.setFont("helvetica", "normal");
  doc.text(tituloPeriodo || "General", 140, y + 13.5);

  doc.setFont("helvetica", "bold");
  doc.text("Fechas:", 112, y + 20.5);
  doc.setFont("helvetica", "normal");
  doc.text(rangoTexto || "-", 140, y + 20.5);

  y += 32;

  // 4. Preparación de datos para la tabla
  let totalHoras = 0;
  let horasCompletadas = 0;

  const filasTabla = actividades.map((act, index) => {
    const horas = horasActividad(act, jornada);
    totalHoras += horas;
    if (act.estado === "completado") horasCompletadas += horas;

    const estadoTexto = act.estado === "completado" ? "COMPLETADO" : "PENDIENTE";
    const horarioTexto = `${act.hora_inicio || "--:--"} - ${act.hora_fin || "--:--"}`;

    const detalleCompleto =
      act.descripcion + (act.entregable ? `\nEntregable / Avance: ${act.entregable}` : "");

    const solicitantesTexto = formatearSolicitantes(act) || "-";

    return [
      index + 1,
      formatearFechaCorta(act.fecha),
      horarioTexto,
      `${horas}h`,
      solicitantesTexto,
      detalleCompleto,
      estadoTexto,
    ];
  });

  // 5. Renderizado de la tabla
  autoTable(doc, {
    startY: y,
    head: [["#", "Fecha", "Horario", "Horas", "Solicitante(s)", "Actividad / Descripción", "Estado"]],
    body: filasTabla,
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: 7.8,
      textColor: [30, 41, 59],
      valign: "middle",
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 24, halign: "center" },
      3: { cellWidth: 14, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 32 },
      5: { cellWidth: 62 },
      6: { cellWidth: 22, halign: "center", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 6) {
        if (data.cell.raw === "COMPLETADO") {
          data.cell.styles.textColor = [21, 128, 61];
        } else {
          data.cell.styles.textColor = [180, 83, 9];
        }
      }
    },
  });

  let finalY = doc.lastAutoTable.finalY + 8;

  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  }

  // 6. Tarjeta de resumen de horas
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...grayBorder);
  doc.roundedRect(14, finalY, 182, 18, 1.5, 1.5, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("RESUMEN DEL PERIODO:", 18, finalY + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkSlate);
  const metaTexto = perfil.meta_horas_semanales
    ? `   |   Meta Semanal: ${perfil.meta_horas_semanales}h`
    : "";

  doc.text(
    `Total Horas: ${totalHoras.toFixed(1)}h   |   Horas Completadas: ${horasCompletadas.toFixed(1)}h   |   Actividades: ${actividades.length}${metaTexto}`,
    18,
    finalY + 13
  );

  finalY += 34;

  // 7. Firmas de responsabilidad
  doc.setDrawColor(148, 163, 184);
  doc.line(25, finalY, 88, finalY);
  doc.line(122, finalY, 185, finalY);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text(perfil.nombre || "Firma del Responsable", 56.5, finalY + 5, { align: "center" });
  doc.text(perfil.supervisor || "Supervisor / Coordinador", 153.5, finalY + 5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${perfil.cargo || "Cargo"}${perfil.identificacion ? ` - ID: ${perfil.identificacion}` : ""}`,
    56.5,
    finalY + 9.5,
    { align: "center" }
  );
  doc.text(perfil.unidad_grupo || perfil.institucion || "Revisión y Conformidad", 153.5, finalY + 9.5, {
    align: "center",
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${totalPages}`,
      105,
      290,
      { align: "center" }
    );
  }

  const nombreLimpio = (perfil.nombre || "actividades")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();

  const nombreArchivo = `reporte_${nombreLimpio}_${new Date().toISOString().slice(0, 10)}.pdf`;
  const arrayBuffer = doc.output("arraybuffer");

  return await guardarArchivoNativo({
    nombreSugerido: nombreArchivo,
    contenido: arrayBuffer,
    mimeType: "application/pdf",
    extension: "pdf",
    descripcionFiltro: "Documento de Reporte en PDF",
  });
};
