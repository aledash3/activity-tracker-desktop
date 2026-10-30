import writeXlsxFile from "write-excel-file/browser";
import readXlsxFile from "read-excel-file/browser";
import { horasActividad } from "./jornada";

// Detección segura de entorno Tauri v2
const esEntornoTauri = () => {
  return (
    typeof window !== "undefined" &&
    (window.__TAURI_INTERNALS__ !== undefined || window.__TAURI__ !== undefined)
  );
};

/**
 * Guarda un archivo en el equipo del usuario.
 * Si se ejecuta en la app de escritorio Tauri v2, abre el diálogo nativo de Windows (Save File)
 * y escribe el archivo directamente en el disco.
 * Si se ejecuta en navegador web estándar, realiza la descarga mediante un elemento <a> y Blob.
 */
export async function guardarArchivoNativo({
  nombreSugerido,
  contenido,
  mimeType = "application/octet-stream",
  extension = "bin",
  descripcionFiltro = "Archivo",
}) {
  const extLimpia = extension.replace(/^\./, "");
  const nombreFinal = nombreSugerido.endsWith(`.${extLimpia}`)
    ? nombreSugerido
    : `${nombreSugerido}.${extLimpia}`;

  if (esEntornoTauri()) {
    try {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { invoke } = await import("@tauri-apps/api/core");

      const rutaSeleccionada = await save({
        defaultPath: nombreFinal,
        filters: [
          {
            name: descripcionFiltro,
            extensions: [extLimpia],
          },
        ],
      });

      if (!rutaSeleccionada) {
        return false; // El usuario canceló la selección de guardado
      }

      // Convertir contenido a Uint8Array
      let bytes;
      if (contenido instanceof Uint8Array) {
        bytes = contenido;
      } else if (contenido instanceof ArrayBuffer) {
        bytes = new Uint8Array(contenido);
      } else if (contenido instanceof Blob) {
        const buffer = await contenido.arrayBuffer();
        bytes = new Uint8Array(buffer);
      } else if (typeof contenido === "string") {
        bytes = new TextEncoder().encode(contenido);
      } else {
        bytes = new TextEncoder().encode(JSON.stringify(contenido, null, 2));
      }

      // Llamar al comando nativo de Rust
      await invoke("guardar_archivo", {
        ruta: rutaSeleccionada,
        datos: Array.from(bytes),
      });

      return true;
    } catch (err) {
      console.warn("Fallo guardado nativo por IPC, intentando fallback:", err);
    }
  }

  // Fallback para navegador web o si ocurre algún imprevisto
  let blob;
  if (contenido instanceof Blob) {
    blob = contenido;
  } else if (contenido instanceof Uint8Array || contenido instanceof ArrayBuffer) {
    blob = new Blob([contenido], { type: mimeType });
  } else if (typeof contenido === "string") {
    blob = new Blob([contenido], { type: mimeType });
  } else {
    blob = new Blob([JSON.stringify(contenido, null, 2)], { type: "application/json" });
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreFinal;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

/**
 * Exporta actividades a formato Microsoft Excel (.xlsx) estructurado
 */
export async function exportarExcelActividades({
  perfil = {},
  jornada,
  actividades = [],
  tituloPeriodo = "Reporte de Actividades",
}) {
  const nombreLimpio = (perfil.nombre || "actividades")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();

  const fechaHoy = new Date().toISOString().slice(0, 10);
  const nombreArchivo = `actividades_${nombreLimpio}_${fechaHoy}.xlsx`;

  // Filas de encabezado de metadatos de usuario
  const metaRows = [
    [
      { value: "BITÁCORA DE CONTROL DE ACTIVIDADES Y HORAS", fontWeight: "bold", fontSize: 13, span: 9 },
    ],
    [
      { value: "Institución / Lugar:", fontWeight: "bold" },
      { value: perfil.institucion || "No especificado", span: 3 },
      { value: "Grupo / Unidad:", fontWeight: "bold" },
      { value: perfil.unidad_grupo || "-", span: 4 },
    ],
    [
      { value: "Responsable:", fontWeight: "bold" },
      { value: `${perfil.nombre || "-"} (ID: ${perfil.identificacion || "-"})`, span: 3 },
      { value: "Cargo / Rol:", fontWeight: "bold" },
      { value: perfil.cargo || "-", span: 4 },
    ],
    [
      { value: "Supervisor:", fontWeight: "bold" },
      { value: perfil.supervisor || "-", span: 3 },
      { value: "Período:", fontWeight: "bold" },
      { value: tituloPeriodo || "Todo el historial", span: 4 },
    ],
    [], // Separador visual
  ];

  // Encabezados de la tabla principal
  const tableHeaders = [
    { value: "#", fontWeight: "bold", backgroundColor: "#0f172a", color: "#ffffff", align: "center" },
    { value: "Fecha", fontWeight: "bold", backgroundColor: "#0f172a", color: "#ffffff" },
    { value: "Hora Inicio", fontWeight: "bold", backgroundColor: "#0f172a", color: "#ffffff", align: "center" },
    { value: "Hora Fin", fontWeight: "bold", backgroundColor: "#0f172a", color: "#ffffff", align: "center" },
    { value: "Horas Netas", fontWeight: "bold", backgroundColor: "#0f172a", color: "#ffffff", align: "right" },
    { value: "Categoría", fontWeight: "bold", backgroundColor: "#0f172a", color: "#ffffff" },
    { value: "Solicitante", fontWeight: "bold", backgroundColor: "#0f172a", color: "#ffffff" },
    { value: "Actividad / Descripción", fontWeight: "bold", backgroundColor: "#0f172a", color: "#ffffff" },
    { value: "Entregable / Avance", fontWeight: "bold", backgroundColor: "#0f172a", color: "#ffffff" },
    { value: "Estado", fontWeight: "bold", backgroundColor: "#0f172a", color: "#ffffff", align: "center" },
  ];

  let sumaHoras = 0;

  const dataRows = actividades.map((a, i) => {
    const horas = horasActividad(a, jornada);
    sumaHoras += horas;
    const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
    return [
      { type: Number, value: i + 1, backgroundColor: bg, align: "center" },
      { type: String, value: a.fecha || "", backgroundColor: bg },
      { type: String, value: a.hora_inicio || "", backgroundColor: bg, align: "center" },
      { type: String, value: a.hora_fin || "", backgroundColor: bg, align: "center" },
      { type: Number, value: Number(horas.toFixed(2)), backgroundColor: bg, align: "right" },
      { type: String, value: a.categoria || "", backgroundColor: bg },
      { type: String, value: a.solicitante || "", backgroundColor: bg },
      { type: String, value: a.descripcion || "", backgroundColor: bg },
      { type: String, value: a.entregable || "", backgroundColor: bg },
      {
        type: String,
        value: (a.estado || "completado").toUpperCase(),
        backgroundColor: bg,
        align: "center",
        fontWeight: "bold",
      },
    ];
  });

  // Fila de resumen total
  const totalRow = [
    { value: "TOTAL", fontWeight: "bold", span: 4, align: "right" },
    null,
    null,
    null,
    { type: Number, value: Number(sumaHoras.toFixed(2)), fontWeight: "bold", align: "right" },
    { value: `Actividades: ${actividades.length}`, fontWeight: "bold", span: 5 },
  ];

  const sheetData = [...metaRows, tableHeaders, ...dataRows, totalRow];

  const columns = [
    { width: 6 },
    { width: 14 },
    { width: 13 },
    { width: 13 },
    { width: 14 },
    { width: 20 },
    { width: 32 },
    { width: 45 },
    { width: 32 },
    { width: 16 },
  ];

  const blob = await writeXlsxFile(sheetData, { columns }).toBlob();

  return await guardarArchivoNativo({
    nombreSugerido: nombreArchivo,
    contenido: blob,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: "xlsx",
    descripcionFiltro: "Libro de Microsoft Excel (.xlsx)",
  });
}

/**
 * Normaliza y analiza un valor de fecha a formato YYYY-MM-DD
 */
function parsearFechaAISO(valor) {
  if (!valor) return "";
  if (valor instanceof Date && !isNaN(valor.getTime())) {
    return valor.toISOString().slice(0, 10);
  }
  const str = String(valor).trim();
  // Formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  // Formato DD/MM/YYYY o DD-MM-YYYY
  const partes = str.split(/[-/]/);
  if (partes.length === 3) {
    if (partes[0].length === 4) {
      // YYYY/MM/DD
      return `${partes[0]}-${partes[1].padStart(2, "0")}-${partes[2].padStart(2, "0")}`;
    }
    // DD/MM/YYYY
    return `${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(2, "0")}`;
  }
  return str;
}

/**
 * Normaliza una hora a formato HH:MM
 */
function parsearHora(valor) {
  if (!valor) return "";
  if (valor instanceof Date && !isNaN(valor.getTime())) {
    const hh = String(valor.getHours()).padStart(2, "0");
    const mm = String(valor.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  const str = String(valor).trim();
  const m = str.match(/(\d{1,2}):(\d{2})/);
  if (m) {
    return `${m[1].padStart(2, "0")}:${m[2]}`;
  }
  return str;
}

/**
 * Analiza un archivo importado (.xlsx, .csv o .json) y extrae las actividades y metadatos
 */
export async function importarArchivoCualquiera(file) {
  const nombre = file.name.toLowerCase();

  // 1. Caso JSON (Copia de seguridad del sistema)
  if (nombre.endsWith(".json")) {
    const texto = await file.text();
    const data = JSON.parse(texto);
    if (data.actividades && Array.isArray(data.actividades)) {
      return {
        tipo: "backup_completo",
        actividades: data.actividades,
        perfil: data.perfil,
        categorias: data.categorias,
        apariencia: data.apariencia,
        cantidad: data.actividades.length,
      };
    }
    if (Array.isArray(data)) {
      return {
        tipo: "lista_actividades",
        actividades: data,
        cantidad: data.length,
      };
    }
    throw new Error("El archivo JSON no tiene un formato reconocido de actividades.");
  }

  // 2. Caso Microsoft Excel (.xlsx / .xls)
  if (nombre.endsWith(".xlsx") || nombre.endsWith(".xls")) {
    const rows = await readXlsxFile(file);
    if (!rows || rows.length === 0) {
      throw new Error("El archivo Excel está vacío.");
    }

    // Buscar la fila de encabezados
    let headerIdx = -1;
    let colIndices = {
      fecha: -1,
      horaInicio: -1,
      horaFin: -1,
      categoria: -1,
      solicitante: -1,
      descripcion: -1,
      entregable: -1,
      estado: -1,
    };

    for (let r = 0; r < Math.min(rows.length, 15); r++) {
      const row = rows[r].map((c) => String(c || "").toLowerCase().trim());
      const fIdx = row.findIndex((c) => c.includes("fecha") || c.includes("date"));
      const dIdx = row.findIndex(
        (c) => c.includes("descrip") || c.includes("actividad") || c.includes("tarea")
      );

      if (fIdx !== -1 || dIdx !== -1) {
        headerIdx = r;
        colIndices.fecha = fIdx;
        colIndices.descripcion = dIdx;
        colIndices.horaInicio = row.findIndex(
          (c) => c.includes("inicio") || c.includes("start") || c.includes("desde")
        );
        colIndices.horaFin = row.findIndex(
          (c) => c.includes("fin") || c.includes("end") || c.includes("hasta")
        );
        colIndices.categoria = row.findIndex((c) => c.includes("categor"));
        colIndices.solicitante = row.findIndex(
          (c) => c.includes("solicitante") || c.includes("responsable") || c.includes("solicita")
        );
        colIndices.entregable = row.findIndex(
          (c) => c.includes("entregable") || c.includes("avance") || c.includes("producto")
        );
        colIndices.estado = row.findIndex((c) => c.includes("estado") || c.includes("status"));
        break;
      }
    }

    if (headerIdx === -1) {
      throw new Error(
        "No se identificaron columnas válidas (Fecha, Actividad/Descripción) en la hoja de Excel."
      );
    }

    const actividadesLeidas = [];
    for (let r = headerIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.every((c) => c === null || c === undefined || String(c).trim() === "")) {
        continue;
      }

      const desc = colIndices.descripcion !== -1 ? String(row[colIndices.descripcion] || "").trim() : "";
      const fechaRaw = colIndices.fecha !== -1 ? row[colIndices.fecha] : "";
      const fecha = parsearFechaAISO(fechaRaw) || new Date().toISOString().slice(0, 10);

      // Descartar posibles filas de totales al pie de la tabla
      if (desc.toLowerCase() === "total" || String(fechaRaw).toLowerCase() === "total") {
        continue;
      }

      const horaInicio =
        colIndices.horaInicio !== -1 ? parsearHora(row[colIndices.horaInicio]) : "09:00";
      const horaFin =
        colIndices.horaFin !== -1 ? parsearHora(row[colIndices.horaFin]) : "10:00";
      const categoria =
        colIndices.categoria !== -1 ? String(row[colIndices.categoria] || "").trim() : "";
      const solicitante =
        colIndices.solicitante !== -1 ? String(row[colIndices.solicitante] || "").trim() : "";
      const entregable =
        colIndices.entregable !== -1 ? String(row[colIndices.entregable] || "").trim() : "";
      const estadoRaw =
        colIndices.estado !== -1 ? String(row[colIndices.estado] || "").toLowerCase().trim() : "";

      let estado = "completado";
      if (estadoRaw.includes("pend") || estadoRaw.includes("todo")) estado = "pendiente";
      if (estadoRaw.includes("prog") || estadoRaw.includes("curso")) estado = "en_progreso";

      if (desc || categoria || solicitante) {
        actividadesLeidas.push({
          id: `act-${Date.now()}-${r}`,
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          categoria,
          solicitante,
          descripcion: desc || "Actividad importada",
          entregable,
          estado,
        });
      }
    }

    return {
      tipo: "lista_actividades",
      actividades: actividadesLeidas,
      cantidad: actividadesLeidas.length,
    };
  }

  // 3. Caso CSV (.csv)
  if (nombre.endsWith(".csv") || file.type.includes("csv")) {
    const texto = await file.text();
    const lineas = texto
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lineas.length < 2) {
      throw new Error("El archivo CSV no contiene suficientes líneas de datos.");
    }

    // Detectar separador (; o , o \t)
    const primeraLinea = lineas[0];
    const sep = primeraLinea.includes(";") ? ";" : primeraLinea.includes("\t") ? "\t" : ",";

    const dividirFilaCSV = (linea) => {
      const regex = new RegExp(`(?:^|${sep})("(?:[^"]|"")*"|[^${sep}]*)`, "g");
      const celdas = [];
      let match;
      while ((match = regex.exec(linea)) !== null) {
        let val = match[1] || "";
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        celdas.push(val.trim());
      }
      return celdas;
    };

    const headers = dividirFilaCSV(primeraLinea).map((h) => h.toLowerCase());
    const colIndices = {
      fecha: headers.findIndex((h) => h.includes("fecha") || h.includes("date")),
      horaInicio: headers.findIndex(
        (h) => h.includes("inicio") || h.includes("start") || h.includes("desde")
      ),
      horaFin: headers.findIndex(
        (h) => h.includes("fin") || h.includes("end") || h.includes("hasta")
      ),
      categoria: headers.findIndex((h) => h.includes("categor")),
      solicitante: headers.findIndex(
        (h) => h.includes("solicitante") || h.includes("responsable") || h.includes("solicita")
      ),
      descripcion: headers.findIndex(
        (h) => h.includes("descrip") || h.includes("actividad") || h.includes("tarea")
      ),
      entregable: headers.findIndex(
        (h) => h.includes("entregable") || h.includes("avance") || h.includes("producto")
      ),
      estado: headers.findIndex((h) => h.includes("estado") || h.includes("status")),
    };

    const actividadesCSV = [];
    for (let i = 1; i < lineas.length; i++) {
      const celdas = dividirFilaCSV(lineas[i]);
      if (celdas.length < 2) continue;

      const desc =
        colIndices.descripcion !== -1 ? celdas[colIndices.descripcion] : celdas[celdas.length - 1];
      const fechaRaw = colIndices.fecha !== -1 ? celdas[colIndices.fecha] : "";
      const fecha = parsearFechaAISO(fechaRaw) || new Date().toISOString().slice(0, 10);
      const horaInicio =
        colIndices.horaInicio !== -1 ? parsearHora(celdas[colIndices.horaInicio]) : "09:00";
      const horaFin = colIndices.horaFin !== -1 ? parsearHora(celdas[colIndices.horaFin]) : "10:00";
      const categoria = colIndices.categoria !== -1 ? celdas[colIndices.categoria] : "";
      const solicitante = colIndices.solicitante !== -1 ? celdas[colIndices.solicitante] : "";
      const entregable = colIndices.entregable !== -1 ? celdas[colIndices.entregable] : "";
      const estadoRaw = (colIndices.estado !== -1 ? celdas[colIndices.estado] : "").toLowerCase();

      let estado = "completado";
      if (estadoRaw.includes("pend")) estado = "pendiente";
      if (estadoRaw.includes("prog")) estado = "en_progreso";

      if (desc || categoria || solicitante) {
        actividadesCSV.push({
          id: `act-${Date.now()}-${i}`,
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          categoria,
          solicitante,
          descripcion: desc || "Actividad importada",
          entregable,
          estado,
        });
      }
    }

    return {
      tipo: "lista_actividades",
      actividades: actividadesCSV,
      cantidad: actividadesCSV.length,
    };
  }

  throw new Error("Formato de archivo no admitido. Selecciona un archivo .xlsx, .csv o .json.");
}
