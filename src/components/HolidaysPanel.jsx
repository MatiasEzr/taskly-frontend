import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { C } from "../constants";
import { holidayApi } from "../api";
import { Alert, EmptyState, Field, TextInput } from "./ui.jsx";

function formatDate(date) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function readError(res, fallback) {
  const body = await res.json().catch(() => null);
  return body?.message || fallback;
}

export function HolidaysPanel() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [nextHoliday, setNextHoliday] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      setError(null);

      const [nextRes, listRes] = await Promise.all([
        holidayApi.getNext(),
        holidayApi.getByYear(year),
      ]);

      if (!nextRes.ok) {
        throw new Error(
          await readError(nextRes, "No se pudo cargar el próximo feriado")
        );
      }

      if (!listRes.ok) {
        throw new Error(
          await readError(listRes, "No se pudieron cargar los feriados")
        );
      }

      const nextData = await nextRes.json();
      const listData = await listRes.json();

      setNextHoliday(nextData);
      setHolidays(listData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, [year]);

  if (loading) {
    return <EmptyState icon="🇦🇷" title="Cargando feriados..." sub="Consultando la API externa" />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "Syne, sans-serif",
            lineHeight: 1,
          }}
        >
          Feriados argentinos
        </h1>

        <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
          Datos obtenidos desde tu backend usando OpenFeign
        </p>
      </div>

      <Alert msg={error} />

      {nextHoliday && (
        <div
          style={{
            background: C.surf,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 18,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: C.surf2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.accent,
              flexShrink: 0,
            }}
          >
            <CalendarDays size={18} />
          </div>

          <div>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
              Próximo feriado
            </p>

            <p style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
              {nextHoliday.name}
            </p>

            <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              {formatDate(nextHoliday.date)} · {nextHoliday.type}
            </p>

            <p style={{ fontSize: 13, color: C.accent, marginTop: 6, fontWeight: 700 }}>
              Faltan {nextHoliday.daysUntil} día{nextHoliday.daysUntil !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      <Field label="Año">
        <TextInput
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min="2020"
          max="2100"
        />
      </Field>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {holidays.length === 0 ? (
          <EmptyState icon="📅" title="Sin feriados" sub="No se encontraron feriados para ese año" />
        ) : (
          holidays.map((holiday) => (
            <div
              key={`${holiday.date}-${holiday.name}`}
              style={{
                background: C.surf,
                border: `1px solid ${C.borderL}`,
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                {holiday.name}
              </p>

              <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                {formatDate(holiday.date)} · {holiday.type}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}