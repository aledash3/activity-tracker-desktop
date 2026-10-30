export const NOMBRES_DIAS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export const NOMBRES_DIAS_CORTOS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

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

export const hoyISO = () => aISO(new Date());

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

// Indice del dia de la semana: Lunes = 0 ... Domingo = 6
export const indiceDia = (isoStr) => {
  const [y, m, d] = isoStr.split("-").map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
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
  const nombreDia = NOMBRES_DIAS[(date.getDay() + 6) % 7];
  const mesNombre = MESES[date.getMonth()];
  return `${nombreDia}, ${d} de ${mesNombre} de ${y}`;
};

export const aMinutos = (horaStr) => {
  if (!horaStr || !horaStr.includes(":")) return 0;
  const [h, m] = horaStr.split(":").map(Number);
  return h * 60 + m;
};

// Horas efectivas de un tramo. `receso` es el almuerzo que aplica ese dia
// ({ inicio, fin, minutos }) o null si no hay; solo se descuenta lo que se solapa.
export const calcularHoras = (horaInicio, horaFin, receso = null) => {
  if (!horaInicio || !horaFin) return 0;
  const ini = aMinutos(horaInicio);
  const fin = aMinutos(horaFin);
  if (fin <= ini) return 0;

  let minutos = fin - ini;

  if (receso) {
    const recesoIni = aMinutos(receso.inicio);
    const recesoFin = aMinutos(receso.fin);
    const tope =
      receso.minutos !== undefined && receso.minutos !== ""
        ? Number(receso.minutos)
        : recesoFin - recesoIni;

    if (recesoFin > recesoIni && tope > 0) {
      const solape = Math.max(0, Math.min(fin, recesoFin) - Math.max(ini, recesoIni));
      minutos -= Math.min(solape, tope);
    }
  }

  return Math.round((Math.max(0, minutos) / 60) * 100) / 100;
};

export const formatearHoras = (horas) => {
  if (!horas || horas <= 0) return "0h";
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};
