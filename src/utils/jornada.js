import {
  NOMBRES_DIAS,
  NOMBRES_DIAS_CORTOS,
  aMinutos,
  calcularHoras,
  indiceDia,
  sumarDias,
} from "./dateUtils";

export const DIAS_LABORABLES_DEFAULT = [0, 1, 2, 3, 4];

const diasValidos = (dias) =>
  Array.isArray(dias)
    ? [...new Set(dias.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort()
    : [];

export const recesoEsValido = (r) =>
  Boolean(r) &&
  diasValidos(r.dias).length > 0 &&
  Boolean(r.inicio) &&
  Boolean(r.fin) &&
  aMinutos(r.fin) > aMinutos(r.inicio);

// Jornada = dias laborables + horarios de almuerzo, derivada del perfil guardado
export const jornadaDePerfil = (perfil = {}) => {
  const dias = diasValidos(perfil.dias_laborables);
  return {
    dias: dias.length > 0 ? dias : DIAS_LABORABLES_DEFAULT,
    recesos: (perfil.recesos || []).filter(recesoEsValido),
  };
};

export const esDiaLaborable = (iso, jornada) => jornada.dias.includes(indiceDia(iso));

export const recesoParaFecha = (jornada, iso) => {
  const dia = indiceDia(iso);
  return jornada.recesos.find((r) => r.dias.includes(dia)) || null;
};

export const horasActividad = (actividad, jornada) =>
  calcularHoras(
    actividad.hora_inicio,
    actividad.hora_fin,
    recesoParaFecha(jornada, actividad.fecha)
  );

// Dias que se muestran en una semana: los laborables y, si hay registros en
// un dia que dejo de ser laborable, ese dia tambien para no ocultar datos.
export const diasVisiblesSemana = (lunes, jornada, fechasConActividades) =>
  [0, 1, 2, 3, 4, 5, 6]
    .map((i) => sumarDias(lunes, i))
    .filter(
      (iso) => esDiaLaborable(iso, jornada) || fechasConActividades.has(iso)
    );

// Busca el dia laborable mas reciente (hacia atras) a partir de una fecha
export const diaLaborableCercano = (iso, jornada) => {
  for (let i = 0; i < 7; i++) {
    const candidata = sumarDias(iso, -i);
    if (esDiaLaborable(candidata, jornada)) return candidata;
  }
  return iso;
};

// "Lunes a Viernes" si son consecutivos, o "Lun, Mié, Sáb" si no lo son
export const etiquetaDias = (dias) => {
  const ordenados = diasValidos(dias);
  if (ordenados.length === 0) return "";
  if (ordenados.length === 1) return NOMBRES_DIAS[ordenados[0]];
  const consecutivos = ordenados.every((d, i) => i === 0 || d === ordenados[i - 1] + 1);
  if (consecutivos) {
    return `${NOMBRES_DIAS[ordenados[0]]} a ${NOMBRES_DIAS[ordenados[ordenados.length - 1]]}`;
  }
  return ordenados.map((d) => NOMBRES_DIAS_CORTOS[d]).join(", ");
};

// Migra los campos antiguos de un unico receso (receso_inicio/receso_fin) al
// modelo actual, para no perder la configuracion guardada en versiones previas
export const migrarJornadaLegacy = (perfil = {}) => {
  const {
    receso_activo: activo,
    receso_inicio: inicio,
    receso_fin: fin,
    receso_minutos: minutos,
    ...resto
  } = perfil;

  if (!Array.isArray(resto.recesos)) {
    const habiaReceso = activo !== false && inicio && fin && aMinutos(fin) > aMinutos(inicio);
    resto.recesos = habiaReceso
      ? [
          {
            id: "almuerzo-1",
            dias: [...DIAS_LABORABLES_DEFAULT],
            inicio,
            fin,
            minutos: minutos === undefined || minutos === "" ? aMinutos(fin) - aMinutos(inicio) : Number(minutos),
          },
        ]
      : [];
  }

  const dias = diasValidos(resto.dias_laborables);
  resto.dias_laborables = dias.length > 0 ? dias : [...DIAS_LABORABLES_DEFAULT];
  return resto;
};
