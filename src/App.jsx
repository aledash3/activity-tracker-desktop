import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navbar from "./components/Navbar";
import WeekNavigator from "./components/WeekNavigator";
import WeeklyGrid from "./components/WeeklyGrid";
import ActivityModal from "./components/ActivityModal";
import ReportsModal from "./components/ReportsModal";
import ProfileModal from "./components/ProfileModal";
import CatalogModal from "./components/CatalogModal";
import AppearanceModal from "./components/AppearanceModal";
import ExportModal from "./components/ExportModal";

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
} from "./utils/storage";

import { importarArchivoCualquiera } from "./utils/fileIo";

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

  // Zoom variable persistido
  const [zoom, setZoom] = useState(() => {
    try {
      const guardado = localStorage.getItem("bitacora_zoom_level");
      const num = Number(guardado);
      if (num >= 70 && num <= 160) return num;
    } catch {
      // Ignorar
    }
    return 100;
  });

  const cambiarZoom = useCallback((delta) => {
    setZoom((prev) => Math.min(160, Math.max(70, prev + delta)));
  }, []);

  const resetearZoom = useCallback(() => {
    setZoom(100);
  }, []);

  // Aplicar zoom dinámico en el elemento raíz
  useEffect(() => {
    document.documentElement.style.zoom = `${zoom / 100}`;
    try {
      localStorage.setItem("bitacora_zoom_level", String(zoom));
    } catch {
      // Ignorar
    }
  }, [zoom]);

  // Listener para Ctrl + rueda del ratón
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 5 : -5;
        setZoom((prev) => Math.min(160, Math.max(70, prev + delta)));
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

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
  const [modalDescarga, setModalDescarga] = useState(false);
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
    root.style.setProperty("--font-primary", fontObj.css);

    let baseSize = "15px";
    if (apariencia.tamanoFuente === "compacto") baseSize = "13.5px";
    if (apariencia.tamanoFuente === "comodo") baseSize = "16.5px";
    root.style.setProperty("--font-base-size", baseSize);

    let radiusSm = "4px";
    let radiusMd = "8px";
    let radiusLg = "12px";

    if (apariencia.bordes === "recto") {
      radiusSm = "1px";
      radiusMd = "2px";
      radiusLg = "3px";
    } else if (apariencia.bordes === "redondeado") {
      radiusSm = "8px";
      radiusMd = "14px";
      radiusLg = "20px";
    }

    root.style.setProperty("--radius-sm", radiusSm);
    root.style.setProperty("--radius-md", radiusMd);
    root.style.setProperty("--radius-lg", radiusLg);
  }, [apariencia]);

  const toggleTema = () => {
    const nuevoTema = apariencia.tema === "dark" ? "light" : "dark";
    const nueva = { ...apariencia, tema: nuevoTema };
    setApariencia(nueva);
    guardarApariencia(nueva);
  };

  const fechasConActividades = useMemo(() => {
    return new Set(actividades.map((a) => a.fecha));
  }, [actividades]);

  const solicitantes = useMemo(() => {
    const nombres = actividades
      .map((a) => a.solicitante?.trim())
      .filter(Boolean);
    return [...new Set(nombres)].sort();
  }, [actividades]);

  const diasVisibles = useMemo(
    () => diasVisiblesSemana(lunesActual, jornada, fechasConActividades),
    [lunesActual, jornada, fechasConActividades]
  );

  const metricasSemana = useMemo(() => {
    const fechasSet = new Set(diasVisibles);
    const delRango = actividades.filter((a) => fechasSet.has(a.fecha));

    let totalHoras = 0;
    let horasCompletadas = 0;
    let cantidadCompletadas = 0;

    delRango.forEach((act) => {
      const h = horasActividad(act, jornada);
      totalHoras += h;
      if (act.estado === "completado") {
        horasCompletadas += h;
        cantidadCompletadas += 1;
      }
    });

    return {
      horasTotales: totalHoras,
      totalHoras,
      horasCompletadas,
      totalActividades: delRango.length,
      cantidadActividades: delRango.length,
      cantidadCompletadas,
    };
  }, [actividades, diasVisibles, jornada]);

  const handleSeleccionarFechaCalendario = (fecha) => {
    setFechaSeleccionada(fecha);
    setLunesActual(lunesDe(fecha));
  };

  const handleNuevaActividad = (fechaSugerida) => {
    setFechaParaNueva(fechaSugerida || fechaSeleccionada || hoy);
    setActividadEditando(null);
    setModalActividad(true);
  };

  const handleEditarActividad = (act) => {
    setActividadEditando(act);
    setFechaParaNueva(act.fecha);
    setModalActividad(true);
  };

  const handleGuardarActividad = (datos) => {
    let nuevas;
    if (actividadEditando) {
      nuevas = actividades.map((a) =>
        a.id === actividadEditando.id ? { ...datos, id: a.id } : a
      );
      mostrarNotificacion("Actividad actualizada");
    } else {
      const nueva = {
        ...datos,
        id: `act-${Date.now()}`,
      };
      nuevas = [...actividades, nueva];
      mostrarNotificacion("Actividad agregada");
    }

    setActividades(nuevas);
    guardarActividades(nuevas);
    setModalActividad(false);
    setActividadEditando(null);

    if (datos.fecha) {
      setFechaSeleccionada(datos.fecha);
      setLunesActual(lunesDe(datos.fecha));
    }
  };

  const handleEliminarActividad = (id) => {
    const nuevas = actividades.filter((a) => a.id !== id);
    setActividades(nuevas);
    guardarActividades(nuevas);
    mostrarNotificacion("Actividad eliminada");
  };

  const handleToggleEstado = (id, nuevoEstado) => {
    const act = actividades.find((a) => a.id === id);
    if (!act) return;

    let siguiente;
    if (nuevoEstado) {
      siguiente = nuevoEstado;
    } else {
      siguiente = act.estado === "completado" ? "pendiente" : "completado";
    }

    const nuevas = actividades.map((a) =>
      a.id === id ? { ...a, estado: siguiente } : a
    );
    setActividades(nuevas);
    guardarActividades(nuevas);

    const nombresEstados = {
      completado: "Completada",
      pendiente: "Pendiente",
    };
    mostrarNotificacion(`Estado: ${nombresEstados[siguiente] || siguiente}`);
  };

  const handleCambiarMetaHoras = (nuevaMeta) => {
    setPerfil((prev) => {
      const actualizado = {
        ...prev,
        meta_horas_semanales: nuevaMeta,
      };
      guardarPerfil(actualizado);
      return actualizado;
    });
    mostrarNotificacion(
      nuevaMeta ? `Meta semanal definida en ${nuevaMeta}h` : "Meta semanal actualizada"
    );
  };

  // Carga e importación universal (.xlsx, .csv, .json)
  const handleImportarArchivo = async (file) => {
    try {
      const resultado = await importarArchivoCualquiera(file);
      if (resultado.tipo === "backup_completo") {
        if (resultado.actividades) guardarActividades(resultado.actividades);
        if (resultado.perfil) guardarPerfil(resultado.perfil);
        if (resultado.categorias) guardarCategorias(resultado.categorias);
        if (resultado.apariencia) guardarApariencia(resultado.apariencia);
        setActividades(cargarActividades());
        setPerfil(cargarPerfil());
        setCategorias(cargarCategorias());
        setApariencia(cargarApariencia());
        mostrarNotificacion(`Copia restaurada exitosamente (${resultado.cantidad} actividades)`);
      } else if (resultado.tipo === "lista_actividades") {
        const existentes = cargarActividades();
        const idsExistentes = new Set(existentes.map((a) => a.id));
        const nuevas = resultado.actividades.filter((a) => !idsExistentes.has(a.id));
        const unificadas = [...existentes, ...nuevas];
        guardarActividades(unificadas);
        setActividades(unificadas);
        mostrarNotificacion(`Se importaron ${resultado.cantidad} actividades correctamente`);
      }
    } catch (err) {
      alert("Error al importar el archivo: " + err.message);
    }
  };

  return (
    <div className="app-layout">
      <Navbar
        perfil={perfil}
        tema={apariencia.tema}
        zoom={zoom}
        onCambiarZoom={cambiarZoom}
        onResetearZoom={resetearZoom}
        onToggleTema={toggleTema}
        onNuevaActividad={() => handleNuevaActividad(fechaSeleccionada)}
        onAbrirReportes={() => setModalReportes(true)}
        onAbrirApariencia={() => setModalApariencia(true)}
        onAbrirPerfil={() => setModalPerfil(true)}
        onAbrirCatalogos={() => setModalCatalogos(true)}
        onAbrirDescarga={() => setModalDescarga(true)}
        onImportarArchivo={handleImportarArchivo}
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
          key={actividadEditando?.id || fechaParaNueva || "nueva"}
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

      {modalDescarga && (
        <ExportModal
          perfil={perfil}
          colorAcento={apariencia.colorAcento}
          jornada={jornada}
          actividades={actividades}
          fechaReferencia={fechaSeleccionada}
          onCerrar={() => setModalDescarga(false)}
          onNotificar={mostrarNotificacion}
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
            guardarPerfil(p);
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
            guardarCategorias(c);
          }}
          onCerrar={() => setModalCatalogos(false)}
        />
      )}
    </div>
  );
}
