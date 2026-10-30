import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MESES, NOMBRES_DIAS_CORTOS, aISO, hoyISO } from "../utils/dateUtils";
import { DIAS_LABORABLES_DEFAULT } from "../utils/jornada";

export default function MiniCalendar({
  fechaSeleccionada,
  onSeleccionarFecha,
  fechasConActividades = new Set(),
  diasLaborables = DIAS_LABORABLES_DEFAULT,
}) {
  const [mesVisto, setMesVisto] = useState(() => {
    const base = fechaSeleccionada
      ? new Date(fechaSeleccionada + "T12:00:00")
      : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const hoy = hoyISO();
  const primerDiaSemana = (mesVisto.getDay() + 6) % 7; // Lunes = 0
  const diasEnMes = new Date(
    mesVisto.getFullYear(),
    mesVisto.getMonth() + 1,
    0
  ).getDate();

  const celdas = [];
  for (let i = 0; i < primerDiaSemana; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const cambiarMes = (delta) => {
    setMesVisto(
      new Date(mesVisto.getFullYear(), mesVisto.getMonth() + delta, 1)
    );
  };

  return (
    <div className="mini-calendario">
      <div className="mini-calendario-header">
        <button
          type="button"
          className="nav-btn"
          onClick={() => cambiarMes(-1)}
          title="Mes anterior"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="mini-calendario-titulo">
          {MESES[mesVisto.getMonth()]} {mesVisto.getFullYear()}
        </span>
        <button
          type="button"
          className="nav-btn"
          onClick={() => cambiarMes(1)}
          title="Mes siguiente"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mini-calendario-dias-header">
        {NOMBRES_DIAS_CORTOS.map((nombre, i) => (
          <span
            key={nombre}
            className={`dia-letra ${diasLaborables.includes(i) ? "" : "dia-letra-inhabil"}`}
          >
            {nombre.charAt(0)}
          </span>
        ))}
      </div>

      <div className="mini-calendario-grid">
        {celdas.map((dia, index) => {
          if (dia === null) {
            return <div key={index} className="celda vacia" />;
          }

          const fechaObj = new Date(
            mesVisto.getFullYear(),
            mesVisto.getMonth(),
            dia
          );
          const diaSemana = (fechaObj.getDay() + 6) % 7;
          const iso = aISO(fechaObj);
          const esHoy = iso === hoy;
          const esSeleccionado = iso === fechaSeleccionada;
          const tieneActividades = fechasConActividades.has(iso);
          const esInhabil = !diasLaborables.includes(diaSemana) && !tieneActividades;

          return (
            <button
              key={index}
              type="button"
              disabled={esInhabil}
              className={`celda ${esHoy ? "hoy" : ""} ${
                esSeleccionado ? "seleccionado" : ""
              } ${esInhabil ? "inhabil" : ""}`}
              onClick={() => !esInhabil && onSeleccionarFecha(iso)}
              title={
                esInhabil
                  ? "Día no laborable"
                  : `${dia} de ${MESES[mesVisto.getMonth()]}`
              }
            >
              <span>{dia}</span>
              {tieneActividades && <span className="punto-actividad" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
