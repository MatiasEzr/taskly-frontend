// Componentes de UI reutilizables.
// Son los "ladrillos" básicos que usan el resto de los componentes:
// inputs, botones, badges, alertas, etc.
 
import { AlertCircle } from "lucide-react";
import { C, PRIORITY, inputStyle } from "../constants";
 
// ── Componentes ───────────────────────────────────────────────────────
 
// Badge de color para mostrar la prioridad de una tarea.
export function PriorityBadge({ p }) {
  const cfg = PRIORITY[p] || PRIORITY.LOW;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: ".05em",
      padding: "2px 7px", borderRadius: 4,
      color: cfg.color, background: cfg.bg,
      textTransform: "uppercase", flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  );
}
 
// Wrapper de campo de formulario con label opcional arriba.
export function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{
          fontSize: 12, color: C.muted, fontWeight: 600,
          letterSpacing: ".04em", textTransform: "uppercase",
        }}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
}
 
// Input de texto estilizado.
export function TextInput(props) {
  return <input style={inputStyle} {...props} />;
}
 
// Textarea estilizado con resize vertical.
export function Textarea(props) {
  return (
    <textarea
      style={{ ...inputStyle, resize: "vertical", minHeight: 76, lineHeight: 1.5 }}
      {...props}
    />
  );
}
 
// Select estilizado.
export function CustomSelect({ children, ...props }) {
  return (
    <select style={{ ...inputStyle, cursor: "pointer" }} {...props}>
      {children}
    </select>
  );
}
 
// Botón con tres variantes: primary (naranja), ghost (transparente), danger (rojo).
export function Btn({ children, variant = "primary", small, ...props }) {
  const variants = {
    primary: { background: C.accent, color: "#0d1117", border: "none" },
    ghost:   { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    danger:  { background: C.danger, color: "#fff", border: "none" },
  };
  return (
    <button
      style={{
        ...variants[variant],
        padding: small ? "6px 14px" : "9px 18px",
        borderRadius: 8, fontWeight: 700,
        fontSize: small ? 13 : 14, cursor: "pointer",
        width: "100%", fontFamily: "inherit",
        display: "flex", alignItems: "center",
        justifyContent: "center", gap: 6,
        transition: "opacity .15s",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
 
// Caja de alerta para mostrar errores o advertencias.
export function Alert({ msg, type = "error" }) {
  if (!msg) return null;
  const colors = {
    error: { bg: "rgba(248,81,73,.1)", border: "rgba(248,81,73,.3)", text: C.danger },
    warn:  { bg: "rgba(227,179,65,.1)", border: "rgba(227,179,65,.3)", text: C.warn },
  };
  const s = colors[type];
  return (
    <div style={{
      padding: "9px 13px", borderRadius: 8,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.text, fontSize: 13,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <AlertCircle size={14} style={{ flexShrink: 0 }} /> {msg}
    </div>
  );
}
 
// Overlay oscuro para modales. Cierra al hacer click fuera del contenido.
export function Overlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surf, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: 24, width: "100%", maxWidth: 460,
          display: "flex", flexDirection: "column", gap: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}
 
// Estado vacío genérico con ícono emoji, título y subtítulo.
export function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 0", color: C.muted }}>
      <div style={{ fontSize: 36, marginBottom: 14, lineHeight: 1 }}>{icon}</div>
      <p style={{ fontWeight: 700, color: C.text, fontSize: 15, fontFamily: "Syne, sans-serif", marginBottom: 4 }}>
        {title}
      </p>
      <p style={{ fontSize: 13 }}>{sub}</p>
    </div>
  );
}
 
// Botón de ícono pequeño para acciones secundarias (editar, eliminar).
export function IconBtn({ children, ...props }) {
  return (
    <button
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: 6, borderRadius: 6, color: C.dim,
        display: "flex", transition: "color .15s",
      }}
      {...props}
    >
      {children}
    </button>
  );
}