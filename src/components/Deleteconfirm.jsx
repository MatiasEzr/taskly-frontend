import { useState } from "react";
import { C } from "../constants";
import { BASE, http } from "../api";
import { Overlay, Btn } from "./ui";

// Modal de confirmación antes de eliminar una tarea.
// Pide confirmación explícita para evitar eliminaciones accidentales.
export function DeleteConfirm({ task, onClose, onDone }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await http.del(`${BASE}/tasks/${task.id}`);
    if (res.ok) {
      onDone();   // refresca la lista en el padre
      onClose();  // cierra el modal
    }
    setLoading(false);
  };

  return (
    <Overlay onClose={onClose}>
      <div>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, fontFamily: "Syne, sans-serif" }}>
          ¿Eliminar tarea?
        </p>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
          <strong style={{ color: C.text }}>"{task.title}"</strong> se eliminará permanentemente.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="danger" onClick={handleDelete} disabled={loading}>
          {loading ? "Eliminando..." : "Eliminar"}
        </Btn>
      </div>
    </Overlay>
  );
}