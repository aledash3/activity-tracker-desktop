import React from "react";
import { NOMBRES_DIAS, NOMBRES_DIAS_CORTOS } from "../utils/dateUtils";

export default function DayPicker({ value, onChange, ariaLabel }) {
  const alternar = (indice) => {
    onChange(
      value.includes(indice)
        ? value.filter((d) => d !== indice)
        : [...value, indice].sort()
    );
  };

  return (
    <div className="day-picker" role="group" aria-label={ariaLabel}>
      {NOMBRES_DIAS_CORTOS.map((corto, i) => (
        <button
          key={corto}
          type="button"
          className={`day-picker-chip ${value.includes(i) ? "is-on" : ""}`}
          aria-pressed={value.includes(i)}
          title={NOMBRES_DIAS[i]}
          onClick={() => alternar(i)}
        >
          {corto}
        </button>
      ))}
    </div>
  );
}
