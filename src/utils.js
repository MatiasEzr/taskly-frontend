// Formatea un datetime ISO a fecha legible en español argentino.
// Ejemplo: "2024-06-15T10:30:00Z" → "15 jun 2024"
export function fmtDate(dt) {
  if (!dt) return null;
  return new Date(dt).toLocaleDateString("es-AR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
 
// Igual que fmtDate pero incluye hora y minutos.
// Ejemplo: "2024-06-15T10:30:00Z" → "15 jun 2024, 10:30"
export function fmtDateTime(dt) {
  if (!dt) return null;
  return new Date(dt).toLocaleString("es-AR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
 
// Devuelve true si la fecha límite ya pasó y la tarea no está completada.
export function isOverdue(dateLimit) {
  return dateLimit && new Date(dateLimit) < new Date();
}
 
