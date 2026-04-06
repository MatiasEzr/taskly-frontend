import { CheckCircle2, Circle, Trash2, Pencil, Clock, CheckCheck } from "lucide-react";
import { C } from "../constants";
import { fmtDate, fmtDateTime, isOverdue } from "../utils";
import { PriorityBadge, IconBtn } from "./ui";

// Muestra una tarea individual en la lista.
// En la vista de historial, readOnly=true oculta los botones de editar y eliminar.
export function TaskCard({ task, onToggle, onEdit, onDelete, readOnly }) {
  const overdue = !task.completed && isOverdue(task.dateLimit);

  return (
    <div style={{
      background: C.surf,
      border: `1px solid ${task.completed ? C.borderL : C.border}`,
      borderRadius: 10, padding: "13px 15px",
      display: "flex", gap: 12, alignItems: "flex-start",
      opacity: task.completed ? 0.65 : 1,
      transition: "opacity .2s",
    }}>

      {/* Botón para marcar como completada / pendiente */}
      <button
        onClick={() => onToggle(task)}
        title={task.completed ? "Marcar pendiente" : "Marcar completada"}
        style={{
          background: "none", border: "none", cursor: "pointer",
          paddingTop: 1, flexShrink: 0,
          color: task.completed ? C.success : C.dim,
          transition: "color .15s",
        }}
      >
        {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>

      {/* Contenido */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: 600, fontSize: 14, color: C.text, lineHeight: 1.4,
          textDecoration: task.completed ? "line-through" : "none",
          textDecorationColor: C.dim, marginBottom: 5,
        }}>
          {task.title}
        </p>

        {task.description && (
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 8 }}>
            {task.description}
          </p>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <PriorityBadge p={task.priority} />

          {task.dateLimit && (
            <span style={{
              fontSize: 12, color: overdue ? C.danger : C.muted,
              display: "flex", alignItems: "center", gap: 3,
            }}>
              <Clock size={11} />
              {overdue ? "Vencida · " : ""}{fmtDate(task.dateLimit)}
            </span>
          )}

          {task.completed && task.completedAt && (
            <span style={{ fontSize: 12, color: C.success, display: "flex", alignItems: "center", gap: 3 }}>
              <CheckCheck size={11} /> {fmtDateTime(task.completedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Acciones (solo en vista de pendientes) */}
      {!readOnly && (
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          <IconBtn onClick={() => onEdit(task)} title="Editar">
            <Pencil size={14} />
          </IconBtn>
          <IconBtn onClick={() => onDelete(task)} title="Eliminar">
            <Trash2 size={14} />
          </IconBtn>
        </div>
      )}
    </div>
  );
}