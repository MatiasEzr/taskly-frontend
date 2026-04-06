import { useState } from "react";
import { X } from "lucide-react";
import { C } from "../constants";
import { BASE, http } from "../api";
import { Overlay, Field, TextInput, Textarea, CustomSelect, Btn, Alert } from "./ui";

// Modal para crear una tarea nueva o editar una existente.
// Si recibe `task`, entra en modo edición y pre-llena el formulario.
// Si no recibe `task`, entra en modo creación con valores vacíos.
export function TaskModal({ task, userId, onClose, onDone }) {
  const editing = !!task;

  const [form, setForm] = useState({
    title:       task?.title       || "",
    description: task?.description || "",
    priority:    task?.priority    || "MEDIUM",
    // dateLimit viene como ISO string; slice(0,16) lo convierte al formato
    // que espera el input datetime-local: "YYYY-MM-DDTHH:mm"
    dateLimit:   task?.dateLimit ? task.dateLimit.slice(0, 16) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Helper para actualizar un campo del formulario sin perder los demás.
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("El título es obligatorio");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body = {
        title:       form.title.trim(),
        description: form.description,
        priority:    form.priority,
        // Si no hay fecha, mandamos null. El backend acepta dateLimit opcional.
        dateLimit:   form.dateLimit ? new Date(form.dateLimit).toISOString() : null,
      };

      const res = editing
        ? await http.put(`${BASE}/tasks/${task.id}`, body)
        : await http.post(`${BASE}/users/${userId}/tasks`, body);

      if (!res.ok) throw new Error("No se pudo guardar la tarea");

      onDone();   // refresca la lista en el padre
      onClose();  // cierra el modal
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      {/* Header del modal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, fontFamily: "Syne, sans-serif" }}>
          {editing ? "Editar tarea" : "Nueva tarea"}
        </h2>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, lineHeight: 1 }}
        >
          <X size={18} />
        </button>
      </div>

      <Alert msg={error} />

      <Field label="Título">
        <TextInput
          value={form.title}
          onChange={set("title")}
          placeholder="¿Qué tenés que hacer?"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          autoFocus
        />
      </Field>

      <Field label="Descripción">
        <Textarea
          value={form.description}
          onChange={set("description")}
          placeholder="Detalles opcionales..."
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Prioridad">
          <CustomSelect value={form.priority} onChange={set("priority")}>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Media</option>
            <option value="LOW">Baja</option>
          </CustomSelect>
        </Field>

        <Field label="Fecha límite">
          <TextInput type="datetime-local" value={form.dateLimit} onChange={set("dateLimit")} />
        </Field>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={handleSave} disabled={loading}>
          {loading ? "Guardando..." : editing ? "Guardar cambios" : "Crear tarea"}
        </Btn>
      </div>
    </Overlay>
  );
}