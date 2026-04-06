// Paleta de colores de la app.
// Se usa como objeto en lugar de variables CSS para poder usarlos
// en estilos en línea de React (style={{ color: C.text }}).
export const C = {
  bg:      "#0d1117",
  surf:    "#161b22",
  surf2:   "#1c2333",
  border:  "#30363d",
  borderL: "#21262d",
  accent:  "#f0883e",
  text:    "#e6edf3",
  muted:   "#8b949e",
  dim:     "#484f58",
  danger:  "#f85149",
  success: "#56d364",
  warn:    "#e3b341",
};
 
// Configuración visual de cada nivel de prioridad.
// Se usa en PriorityBadge y para ordenar las tareas.
export const PRIORITY = {
  HIGH:   { label: "Alta",  color: "#f85149", bg: "rgba(248,81,73,.13)"  },
  MEDIUM: { label: "Media", color: "#e3b341", bg: "rgba(227,179,65,.13)" },
  LOW:    { label: "Baja",  color: "#56d364", bg: "rgba(86,211,100,.13)" },
};
 
// Orden numérico para ordenar tareas por prioridad (menor = primero).
export const PORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

// Estilo base compartido para inputs, textareas y selects.
export const inputStyle = {
  background: "#1c2333",
  border: "1px solid #30363d",
  borderRadius: 8,
  padding: "9px 13px",
  color: "#e6edf3",
  fontSize: 14,
  width: "100%",
  fontFamily: "inherit",
};

