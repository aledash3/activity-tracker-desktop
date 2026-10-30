import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MESES, aISO, hoyISO } from "../utils/dateUtils";

export default function MiniCalendar({
  fechaSeleccionada,
  onSeleccionarFecha,
  fechasConActividades = new Set(),
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

  const DIAS_LETRA = ["L", "M", "M", "J", "V", "S", "D"];

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
        {DIAS_LETRA.map((letra, i) => (
          <span
            key={i}
            className={`dia-letra ${i >= 5 ? "dia-letra-inhabil" : ""}`}
          >
            {letra}
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
          const diaSemana = (fechaObj.getDay() + 6) % 7; // 5=Sáb, 6=Dom
          const esInhabil = diaSemana >= 5;
          const iso = aISO(fechaObj);
          const esHoy = iso === hoy;
          const esSeleccionado = iso === fechaSeleccionada;
          const tieneActividades = fechasConActividades.has(iso);

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
                  ? "Fin de semana deshabilitado"
                  : `${dia} de ${MESES[mesVisto.getMonth()]}`
              }
            >
              <span>{dia}</span>
              {tieneActividades && !esInhabil && <span className="punto-actividad" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
