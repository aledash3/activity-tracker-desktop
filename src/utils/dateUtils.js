export const NOMBRES_DIAS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
];

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const aISO = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const hoyISO = () => {
  const hoy = new Date();
  const day = hoy.getDay();
  // Si hoy es sábado (6) o domingo (0), situar por defecto en el viernes o lunes de la semana laboral
  if (day === 6) {
    hoy.setDate(hoy.getDate() - 1);
  } else if (day === 0) {
    hoy.setDate(hoy.getDate() + 1);
  }
  return aISO(hoy);
};

export const sumarDias = (isoStr, dias) => {
  const [y, m, d] = isoStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + dias);
  return aISO(date);
};

export const lunesDe = (isoStr) => {
  const [y, m, d] = isoStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const diaSemana = (date.getDay() + 6) % 7; // Lunes = 0, Domingo = 6
  date.setDate(date.getDate() - diaSemana);
  return aISO(date);
};

export const esFinDeSemana = (isoStr) => {
  if (!isoStr) return false;
  const [y, m, d] = isoStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const formatearFechaCorta = (isoStr) => {
  if (!isoStr) return "";
  const [y, m, d] = isoStr.split("-");
  return `${d}/${m}/${y}`;
};

export const formatearDiaMes = (isoStr) => {
  if (!isoStr) return "";
  const [, m, d] = isoStr.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MESES[m - 1]?.slice(0, 3) || ""}`;
};

export const formatearFechaTexto = (isoStr) => {
  if (!isoStr) return "";
  const [y, m, d] = isoStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const todosDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const nombreDia = todosDias[(date.getDay() + 6) % 7];
  const mesNombre = MESES[date.getMonth()];
  return `${nombreDia}, ${d} de ${mesNombre} de ${y}`;
};

export const aMinutos = (horaStr) => {
  if (!horaStr || !horaStr.includes(":")) return 0;
  const [h, m] = horaStr.split(":").map(Number);
  return h * 60 + m;
};

// Calcula las horas efectivas descontando de forma implícita el receso configurado
export const calcularHoras = (horaInicio, horaFin, configReceso = null) => {
  if (!horaInicio || !horaFin) return 0;
  const ini = aMinutos(horaInicio);
  const fin = aMinutos(horaFin);
  if (fin <= ini) return 0;

  let minutosBrutos = fin - ini;

  const recesoActivo = configReceso ? configReceso.activo !== false : true;
  const recesoIni = aMinutos(configReceso?.inicio || "13:00");
  const recesoFin = aMinutos(configReceso?.fin || "14:00");
  const maxMinutosDescuento =
    configReceso?.minutos !== undefined && configReceso?.minutos !== ""
      ? Number(configReceso.minutos)
      : Math.max(0, recesoFin - recesoIni);

  if (recesoActivo && recesoFin > recesoIni && maxMinutosDescuento > 0) {
    const solapeInicio = Math.max(ini, recesoIni);
    const solapeFin = Math.min(fin, recesoFin);
    const minutosSolapados = Math.max(0, solapeFin - solapeInicio);
    const descuento = Math.min(minutosSolapados, maxMinutosDescuento);
    minutosBrutos = Math.max(0, minutosBrutos - descuento);
  }

  return Math.round((minutosBrutos / 60) * 100) / 100;
};

export const formatearHoras = (horas) => {
  if (!horas || horas <= 0) return "0h";
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};
