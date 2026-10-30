import { hoyISO } from "./dateUtils";
import { DIAS_LABORABLES_DEFAULT, migrarJornadaLegacy } from "./jornada";
import {
  DEFAULT_ACTIVIDADES_SEMANA,
  DEFAULT_PERFIL_USUARIO,
  DEFAULT_APARIENCIA_USUARIO,
} from "./initialData";
import { guardarArchivoNativo } from "./fileIo";
import { normalizarSolicitantes } from "./solicitantes";

const KEY_ACTIVIDADES = "bitacora_actividades_data_v3";
const KEY_PERFIL = "bitacora_actividades_perfil_v3";
const KEY_APARIENCIA = "bitacora_actividades_apariencia_v3";

export const PALETAS_COLOR = [
  { id: "cobalto", nombre: "Azul Cobalto", hex: "#2563eb" },
  { id: "esmeralda", nombre: "Verde Esmeralda", hex: "#059669" },
  { id: "indigo", nombre: "Índigo", hex: "#4f46e5" },
  { id: "terracota", nombre: "Terracota", hex: "#d97706" },
  { id: "carmesi", nombre: "Carmesí", hex: "#e11d48" },
  { id: "grafito", nombre: "Grafito", hex: "#475569" },
];

export const OPCIONES_CALIGRAFIA = [
  {
    id: "Plus Jakarta Sans",
    nombre: "Plus Jakarta Sans",
    categoria: "Moderna Geométrica",
    css: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  {
    id: "Inter",
    nombre: "Inter",
    categoria: "Técnica Neutra",
    css: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  {
    id: "Lora",
    nombre: "Lora",
    categoria: "Editorial Serif",
    css: "'Lora', Georgia, serif",
  },
  {
    id: "Playfair Display",
    nombre: "Playfair Display",
    categoria: "Clásica Académica",
    css: "'Playfair Display', Georgia, serif",
  },
  {
    id: "Caveat",
    nombre: "Caveat",
    categoria: "Caligráfica Manuscrita",
    css: "'Caveat', cursive, sans-serif",
  },
  {
    id: "Dancing Script",
    nombre: "Dancing Script",
    categoria: "Caligráfica Cursiva",
    css: "'Dancing Script', cursive, sans-serif",
  },
  {
    id: "JetBrains Mono",
    nombre: "JetBrains Mono",
    categoria: "Monoespaciada",
    css: "'JetBrains Mono', monospace",
  },
];

export const PERFIL_VACIO = {
  nombre: "",
  identificacion: "",
  institucion: "",
  unidad_grupo: "",
  cargo: "",
  supervisor: "",
  meta_horas_semanales: "",
  dias_laborables: DIAS_LABORABLES_DEFAULT,
  recesos: [],
};

export const APARIENCIA_DEFAULT = {
  tema: "light",
  colorAcento: "#2563eb",
  fuente: "Plus Jakarta Sans",
  tamanoFuente: "normal",
  bordes: "suave",
};

export const cargarActividades = () => {
  try {
    const raw = localStorage.getItem(KEY_ACTIVIDADES);
    let lista = [];
    if (!raw) {
      if (DEFAULT_ACTIVIDADES_SEMANA && DEFAULT_ACTIVIDADES_SEMANA.length > 0) {
        lista = [...DEFAULT_ACTIVIDADES_SEMANA];
      }
    } else {
      const parsed = JSON.parse(raw);
      lista = Array.isArray(parsed) ? parsed : [];
    }

    // Unificar con actividades predeterminadas/respaldadas para evitar pérdida de registros
    if (DEFAULT_ACTIVIDADES_SEMANA && DEFAULT_ACTIVIDADES_SEMANA.length > 0) {
      const idsExistentes = new Set(lista.map((a) => a.id));
      DEFAULT_ACTIVIDADES_SEMANA.forEach((defAct) => {
        if (!idsExistentes.has(defAct.id)) {
          lista.push(defAct);
        }
      });
    }

    // Normalizar múltiples solicitantes y limpiar campo obsoleto categoria
    lista = lista.map((act) => {
      const solicitantes = normalizarSolicitantes(act);
      const { categoria, ...resto } = act;
      return {
        ...resto,
        solicitantes,
        solicitante: solicitantes.join(", "),
      };
    });

    guardarActividades(lista);
    return lista;
  } catch {
    return DEFAULT_ACTIVIDADES_SEMANA ? [...DEFAULT_ACTIVIDADES_SEMANA] : [];
  }
};

export const guardarActividades = (actividades) => {
  try {
    const normalizadas = (actividades || []).map((act) => {
      const solicitantes = normalizarSolicitantes(act);
      const { categoria, ...resto } = act;
      return {
        ...resto,
        solicitantes,
        solicitante: solicitantes.join(", "),
      };
    });
    localStorage.setItem(KEY_ACTIVIDADES, JSON.stringify(normalizadas));
  } catch (e) {
    console.error("Error al guardar actividades", e);
  }
};

const normalizarPerfil = (perfil) => ({ ...PERFIL_VACIO, ...migrarJornadaLegacy(perfil) });

export const cargarPerfil = () => {
  try {
    const raw = localStorage.getItem(KEY_PERFIL);
    if (!raw) {
      if (DEFAULT_PERFIL_USUARIO && DEFAULT_PERFIL_USUARIO.nombre) {
        guardarPerfil(DEFAULT_PERFIL_USUARIO);
        return normalizarPerfil(DEFAULT_PERFIL_USUARIO);
      }
      return { ...PERFIL_VACIO };
    }
    return normalizarPerfil(JSON.parse(raw));
  } catch {
    return normalizarPerfil(DEFAULT_PERFIL_USUARIO || PERFIL_VACIO);
  }
};

export const guardarPerfil = (perfil) => {
  try {
    localStorage.setItem(KEY_PERFIL, JSON.stringify(perfil));
  } catch (e) {
    console.error("Error al guardar perfil", e);
  }
};

export const cargarApariencia = () => {
  try {
    const raw = localStorage.getItem(KEY_APARIENCIA);
    if (!raw) {
      if (DEFAULT_APARIENCIA_USUARIO) {
        guardarApariencia(DEFAULT_APARIENCIA_USUARIO);
        return { ...DEFAULT_APARIENCIA_USUARIO };
      }
      return { ...APARIENCIA_DEFAULT };
    }
    return { ...APARIENCIA_DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_APARIENCIA_USUARIO };
  }
};

export const guardarApariencia = (apariencia) => {
  try {
    localStorage.setItem(KEY_APARIENCIA, JSON.stringify(apariencia));
  } catch {
    // Ignorar
  }
};

export const exportarBackupJSON = async () => {
  const data = {
    version: "3.2",
    fecha_exportacion: new Date().toISOString(),
    perfil: cargarPerfil(),
    apariencia: cargarApariencia(),
    actividades: cargarActividades(),
  };

  const nombreArchivo = `respaldo_actividades_${hoyISO()}.json`;

  return await guardarArchivoNativo({
    nombreSugerido: nombreArchivo,
    contenido: JSON.stringify(data, null, 2),
    mimeType: "application/json",
    extension: "json",
    descripcionFiltro: "Copia de Seguridad JSON",
  });
};

export const importarBackupJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.actividades && Array.isArray(data.actividades)) {
          guardarActividades(data.actividades);
          if (data.perfil) guardarPerfil(normalizarPerfil(data.perfil));
          if (data.apariencia) guardarApariencia({ ...APARIENCIA_DEFAULT, ...data.apariencia });
          resolve(true);
        } else {
          reject(new Error("El archivo no contiene un listado válido de actividades."));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo seleccionado."));
    reader.readAsText(file);
  });
};
