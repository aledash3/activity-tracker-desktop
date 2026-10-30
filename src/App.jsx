import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import WeekNavigator from "./components/WeekNavigator";
import WeeklyGrid from "./components/WeeklyGrid";
import ActivityModal from "./components/ActivityModal";
import ReportsModal from "./components/ReportsModal";
import ProfileModal from "./components/ProfileModal";
import CatalogModal from "./components/CatalogModal";
import AppearanceModal from "./components/AppearanceModal";

import {
  cargarActividades,
  guardarActividades,
  cargarPerfil,
  guardarPerfil,
  cargarCategorias,
  guardarCategorias,
  cargarApariencia,
  guardarApariencia,
  OPCIONES_CALIGRAFIA,
  exportarBackupJSON,
  importarBackupJSON,
} from "./utils/storage";

import { hoyISO, lunesDe } from "./utils/dateUtils";
import {
  jornadaDePerfil,
  diasVisiblesSemana,
  diaLaborableCercano,
  etiquetaDias,
  horasActividad,
} from "./utils/jornada";

// Convierte un código hex en variantes rgba para fondos suaves y bordes
const hexToRgba = (hex, alpha) => {
  const clean = (hex || "#2563eb").replace("#", "");
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return `rgba(37, 99, 235, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function App() {
  const hoy = hoyISO();

  const [actividades, setActividades] = useState(cargarActividades);
  const [perfil, setPerfil] = useState(cargarPerfil);
  const [categorias, setCategorias] = useState(cargarCategorias);
  const [apariencia, setApariencia] = useState(cargarApariencia);

  const jornada = useMemo(
    () => jornadaDePerfil({ dias_laborables: perfil.dias_laborables, recesos: perfil.recesos }),
    [perfil.dias_laborables, perfil.recesos]
  );

  const [fechaSeleccionada, setFechaSeleccionada] = useState(() =>
    diaLaborableCercano(hoy, jornada)
  );
  const [lunesActual, setLunesActual] = useState(() =>
    lunesDe(diaLaborableCercano(hoy, jornada))
  );

  // Modales
  const [modalActividad, setModalActividad] = useState(false);
  const [actividadEditando, setActividadEditando] = useState(null);
  const [fechaParaNueva, setFechaParaNueva] = useState(hoy);

  const [modalReportes, setModalReportes] = useState(false);
  const [modalApariencia, setModalApariencia] = useState(false);
  const [modalPerfil, setModalPerfil] = useState(false);
  const [modalCatalogos, setModalCatalogos] = useState(false);

  const [mensajeToast, setMensajeToast] = useState("");

  const mostrarNotificacion = (texto) => {
    setMensajeToast(texto);
    setTimeout(() => setMensajeToast(""), 3000);
  };

  // Aplicar tema, colores, caligrafía, escala y bordes en tiempo real
  useEffect(() => {
    const root = document.documentElement;
    const tema = apariencia.tema || "light";
    const color = apariencia.colorAcento || "#2563eb";

    root.setAttribute("data-theme", tema);
    root.style.setProperty("--accent", color);
    root.style.setProperty("--accent-hover", color);
    root.style.setProperty(
      "--accent-soft",
      hexToRgba(color, tema === "dark" ? 0.22 : 0.12)
    );
    root.style.setProperty(
      "--accent-text",
      tema === "dark" ? "#f8fafc" : color
    );

    const fontObj =
      OPCIONES_CALIGRAFIA.find((f) => f.id === apariencia.fuente) ||
      OPCIONES_CALIGRAFIA[0];
    root.style.setProperty("--font-sans", fontObj.css);

    const escala =
      apariencia.tamanoFuente === "compacto"
        ? "14px"
        : apariencia.tamanoFuente === "grande"
        ? "17px"
        : "15.5px";
    root.style.fontSize = escala;

    if (apariencia.bordes === "recto") {
      root.style.setProperty("--radius-lg", "2px");
      root.style.setProperty("--radius-md", "2px");
      root.style.setProperty("--radius-sm", "2px");
    } else if (apariencia.bordes === "redondeado") {
      root.style.setProperty("--radius-lg", "16px");
      root.style.setProperty("--radius-md", "12px");
      root.style.setProperty("--radius-sm", "8px");
    } else {
      root.style.setProperty("--radius-lg", "10px");
      root.style.setProperty("--radius-md", "8px");
      root.style.setProperty("--radius-sm", "6px");
    }

    guardarApariencia(apariencia);
  }, [apariencia]);

  useEffect(() => {
    guardarActividades(actividades);
  }, [actividades]);

  useEffect(() => {
    guardarPerfil(perfil);
  }, [perfil]);

  useEffect(() => {
    guardarCategorias(categorias);
  }, [categorias]);

  const toggleTema = () => {
    setApariencia((prev) => ({
      ...prev,
      tema: prev.tema === "dark" ? "light" : "dark",
    }));
  };

  const fechasConActividades = useMemo(() => {
    return new Set(actividades.map((a) => a.fecha));
  }, [actividades]);

  const diasVisibles = useMemo(
    () => diasVisiblesSemana(lunesActual, jornada, fechasConActividades),
    [lunesActual, jornada, fechasConActividades]
  );

  const solicitantes = useMemo(() => {
    const todos = actividades.map((a) => a.solicitante).filter(Boolean);
    if (perfil.supervisor?.trim()) todos.push(perfil.supervisor.trim());
    return [...new Set(todos)].sort((a, b) => a.localeCompare(b));
  }, [actividades, perfil.supervisor]);

  const metricasSemana = useMemo(() => {
    const actividadesSemana = actividades.filter((a) =>
      diasVisibles.includes(a.fecha)
    );

    let horasTotales = 0;
    let horasCompletadas = 0;

    actividadesSemana.forEach((a) => {
      const h = horasActividad(a, jornada);
      horasTotales += h;
      if (a.estado === "completado") {
        horasCompletadas += h;
      }
    });

    return {
      totalActividades: actividadesSemana.length,
      horasTotales,
      horasCompletadas,
    };
  }, [actividades, diasVisibles, jornada]);
  const handleSeleccionarFechaCalendario = (iso) => {
    setFechaSeleccionada(iso);
    setLunesActual(lunesDe(iso));
  };

  const handleNuevaActividad = (fecha = null) => {
    const fechaObjetivo =
      typeof fecha === "string" && fecha ? fecha : fechaSeleccionada || hoy;
    setFechaParaNueva(fechaObjetivo);
    setActividadEditando(null);
    setModalActividad(true);
  };

  const handleEditarActividad = (act) => {
    setActividadEditando(act);
    setFechaParaNueva(act.fecha);
    setModalActividad(true);
  };

  const handleGuardarActividad = (actividadGuardada) => {
    if (actividadEditando) {
      setActividades((prev) =>
        prev.map((a) =>
          a.id === actividadGuardada.id ? actividadGuardada : a
        )
      );
      mostrarNotificacion("Actividad actualizada");
    } else {
      setActividades((prev) => [...prev, actividadGuardada]);
      mostrarNotificacion("Actividad agregada");
    }
    setModalActividad(false);
    setActividadEditando(null);
  };

  const handleEliminarActividad = (id) => {
    if (window.confirm("¿Deseas eliminar esta actividad?")) {
      setActividades((prev) => prev.filter((a) => a.id !== id));
      mostrarNotificacion("Actividad eliminada");
    }
  };

  const handleToggleEstado = (id, nuevoEstado) => {
    setActividades((prev) =>
      prev.map((a) => (a.id === id ? { ...a, estado: nuevoEstado } : a))
    );
  };

  const handleCambiarMetaHoras = (nuevaMeta) => {
    setPerfil((prev) => ({
      ...prev,
      meta_horas_semanales: nuevaMeta,
    }));
    mostrarNotificacion(
      nuevaMeta ? `Meta semanal definida en ${nuevaMeta}h` : "Meta semanal actualizada"
    );
  };

  const handleImportarBackup = async (file) => {
    try {
      await importarBackupJSON(file);
      setActividades(cargarActividades());
      setPerfil(cargarPerfil());
      setCategorias(cargarCategorias());
      setApariencia(cargarApariencia());
      mostrarNotificacion("Respaldo importado correctamente");
    } catch (err) {
      alert("Error al importar el respaldo: " + err.message);
    }
  };

  return (
    <div className="app-layout">
      <Navbar
        perfil={perfil}
        tema={apariencia.tema}
        onToggleTema={toggleTema}
        onNuevaActividad={() => handleNuevaActividad(fechaSeleccionada)}
        onAbrirReportes={() => setModalReportes(true)}
        onAbrirApariencia={() => setModalApariencia(true)}
        onAbrirPerfil={() => setModalPerfil(true)}
        onAbrirCatalogos={() => setModalCatalogos(true)}
        onExportarBackup={exportarBackupJSON}
        onImportarBackup={handleImportarBackup}
      />

      <main className="main-content">
        <div className="content-container">
          <WeekNavigator
            lunesActual={lunesActual}
            diasVisibles={diasVisibles}
            etiquetaJornada={etiquetaDias(jornada.dias)}
            diasLaborables={jornada.dias}
            fechaSeleccionada={fechaSeleccionada}
            onCambiarLunes={setLunesActual}
            onSeleccionarFecha={handleSeleccionarFechaCalendario}
            fechasConActividades={fechasConActividades}
            metricasSemana={metricasSemana}
            metaHorasSemanales={perfil.meta_horas_semanales}
            onCambiarMetaHoras={handleCambiarMetaHoras}
          />

          <section
            className="weekly-schedule-section"
            aria-label="Calendario semanal"
          >
            <WeeklyGrid
              diasVisibles={diasVisibles}
              actividades={actividades}
              jornada={jornada}
              onNuevaActividad={handleNuevaActividad}
              onEditarActividad={handleEditarActividad}
              onEliminarActividad={handleEliminarActividad}
              onToggleEstado={handleToggleEstado}
            />
          </section>
        </div>
      </main>

      {mensajeToast && (
        <div className="floating-toast" role="status" aria-live="polite">
          <span>{mensajeToast}</span>
        </div>
      )}

      {modalActividad && (
        <ActivityModal
          actividadEditando={actividadEditando}
          fechaPredeterminada={fechaParaNueva}
          categorias={categorias}
          solicitantes={solicitantes}
          jornada={jornada}
          onGuardar={handleGuardarActividad}
          onCerrar={() => {
            setModalActividad(false);
            setActividadEditando(null);
          }}
        />
      )}

      {modalReportes && (
        <ReportsModal
          perfil={perfil}
          colorAcento={apariencia.colorAcento}
          jornada={jornada}
          actividades={actividades}
          fechaReferencia={fechaSeleccionada}
          onCerrar={() => setModalReportes(false)}
        />
      )}

      {modalApariencia && (
        <AppearanceModal
          apariencia={apariencia}
          onCambiarApariencia={setApariencia}
          onCerrar={() => setModalApariencia(false)}
        />
      )}

      {modalPerfil && (
        <ProfileModal
          perfil={perfil}
          onGuardar={(p) => {
            setPerfil(p);
            mostrarNotificacion("Configuración guardada");
          }}
          onCerrar={() => setModalPerfil(false)}
        />
      )}

      {modalCatalogos && (
        <CatalogModal
          categorias={categorias}
          onGuardar={(c) => {
            setCategorias(c);
          }}
          onCerrar={() => setModalCatalogos(false)}
        />
      )}
    </div>
  );
}
