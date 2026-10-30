import { hoyISO } from "./dateUtils";

const KEY_ACTIVIDADES = "bitacora_actividades_data_v3";
const KEY_PERFIL = "bitacora_actividades_perfil_v3";
const KEY_CATEGORIAS = "bitacora_actividades_categorias_v3";
const KEY_APARIENCIA = "bitacora_actividades_apariencia_v3";

// Limpiar claves de versiones previas para iniciar completamente en blanco
try {
  localStorage.removeItem("actividades_personal_data_v1");
  localStorage.removeItem("actividades_personal_perfil_v1");
  localStorage.removeItem("actividades_personal_tipos_v1");
  localStorage.removeItem("registro_actividades_data_v2");
  localStorage.removeItem("registro_actividades_perfil_v2");
  localStorage.removeItem("registro_actividades_categorias_v2");
  localStorage.removeItem("registro_actividades_tema_v2");
} catch {
  // Ignorar si localStorage no está disponible
}

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
  receso_activo: true,
  receso_inicio: "13:00",
  receso_fin: "14:00",
  receso_minutos: 60,
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const guardarActividades = (actividades) => {
  try {
    localStorage.setItem(KEY_ACTIVIDADES, JSON.stringify(actividades));
  } catch (e) {
    console.error("Error al guardar actividades", e);
  }
};

export const cargarPerfil = () => {
  try {
    const raw = localStorage.getItem(KEY_PERFIL);
    if (!raw) return { ...PERFIL_VACIO };
    return { ...PERFIL_VACIO, ...JSON.parse(raw) };
  } catch {
    return { ...PERFIL_VACIO };
  }
};

export const guardarPerfil = (perfil) => {
  try {
    localStorage.setItem(KEY_PERFIL, JSON.stringify(perfil));
  } catch (e) {
    console.error("Error al guardar perfil", e);
  }
};

export const cargarCategorias = () => {
  try {
    const raw = localStorage.getItem(KEY_CATEGORIAS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const guardarCategorias = (categorias) => {
  try {
    localStorage.setItem(KEY_CATEGORIAS, JSON.stringify(categorias));
  } catch (e) {
    console.error("Error al guardar categorías", e);
  }
};

export const cargarApariencia = () => {
  try {
    const raw = localStorage.getItem(KEY_APARIENCIA);
    if (!raw) return { ...APARIENCIA_DEFAULT };
    return { ...APARIENCIA_DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...APARIENCIA_DEFAULT };
  }
};

export const guardarApariencia = (apariencia) => {
  try {
    localStorage.setItem(KEY_APARIENCIA, JSON.stringify(apariencia));
  } catch {
    // Ignorar
  }
};

export const exportarBackupJSON = () => {
  const data = {
    version: "3.0",
    fecha_exportacion: new Date().toISOString(),
    perfil: cargarPerfil(),
    categorias: cargarCategorias(),
    apariencia: cargarApariencia(),
    actividades: cargarActividades(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `respaldo_actividades_${hoyISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importarBackupJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.actividades && Array.isArray(data.actividades)) {
          guardarActividades(data.actividades);
          if (data.perfil) guardarPerfil({ ...PERFIL_VACIO, ...data.perfil });
          if (Array.isArray(data.categorias)) guardarCategorias(data.categorias);
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
