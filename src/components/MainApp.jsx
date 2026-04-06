import { useState, useEffect } from "react";
import { Plus, LogOut } from "lucide-react";
import { C, PORDER } from "../constants";
import { BASE, http } from "../api";
import { Alert, EmptyState } from "./ui.jsx";
import { TaskCard } from "./Taskcard.jsx";
import { TaskModal } from "./Taskmodal.jsx";
import { DeleteConfirm } from "./DeleteConfirm";

// Vista principal de la app para usuarios autenticados.
// Maneja la lista de tareas, las tabs de navegación y los modales.
export function MainApp({ user, onLogout }) {
  const [tasks,    setTasks]    = useState([]);
  const [view,     setView]     = useState("tasks"); // "tasks" | "history"
  const [modal,    setModal]    = useState(null);    // null | { mode, task? }
  const [toDelete, setToDelete] = useState(null);    // null | task
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // Carga todas las tareas del usuario desde el backend.
  const loadTasks = async () => {
    try {
      const res = await http.get(`${BASE}/users/${user.id}/tasks`);
      if (!res.ok) throw new Error("No se pudieron cargar las tareas");
      setTasks(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Carga las tareas al montar el componente (cuando el usuario inicia sesión).
  useEffect(() => { loadTasks(); }, []);

  // Alterna entre completada y pendiente.
  const handleToggle = async (task) => {
    const res = await http.patch(`${BASE}/tasks/${task.id}/complete`, { completed: !task.completed });
    if (res.ok) loadTasks();
  };

  // Separa y ordena las tareas según su estado.
  const pending = tasks
    .filter((t) => !t.completed)
    .sort((a, b) =>
      // Primero por prioridad (HIGH > MEDIUM > LOW), luego por fecha límite.
      PORDER[a.priority] - PORDER[b.priority] ||
      (a.dateLimit || "").localeCompare(b.dateLimit || "")
    );

  const completed = tasks
    .filter((t) => t.completed)
    .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));

  const overdueCount = pending.filter((t) => t.dateLimit && new Date(t.dateLimit) < new Date()).length;

  const tabs = [
    { id: "tasks",   label: "Pendientes", count: pending.length },
    { id: "history", label: "Historial",  count: completed.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>

      {/* ── Header */}
      <header style={{
        borderBottom: `1px solid ${C.borderL}`, position: "sticky", top: 0,
        background: "rgba(13,17,23,.92)", backdropFilter: "blur(8px)", zIndex: 50,
      }}>
        <div style={{
          maxWidth: 680, margin: "0 auto", padding: "0 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", height: 54,
        }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, background: C.accent, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#0d1117" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "Syne, sans-serif", letterSpacing: ".01em" }}>
              Taskly
            </span>
          </div>

          {/* Tabs de navegación */}
          <nav style={{ display: "flex", gap: 2 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                style={{
                  padding: "5px 12px", borderRadius: 6, fontWeight: 600, fontSize: 13,
                  cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all .15s",
                  background: view === tab.id ? C.surf2 : "transparent",
                  color: view === tab.id ? C.text : C.muted,
                }}
              >
                {tab.label}
                <span style={{ marginLeft: 5, fontSize: 11, fontWeight: 700, color: view === tab.id ? C.accent : C.dim }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>

          {/* Email del usuario + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: C.muted, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </span>
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex", padding: 4 }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Contenido */}
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px" }}>
        {loading ? (
          <EmptyState icon="⏳" title="Cargando..." sub="Obteniendo tus tareas" />
        ) : error ? (
          <div style={{ padding: "40px 0" }}><Alert msg={error} /></div>
        ) : (
          <>
            {/* Vista: Tareas pendientes */}
            {view === "tasks" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "Syne, sans-serif", lineHeight: 1 }}>
                      Mis tareas
                    </h1>
                    {pending.length > 0 && (
                      <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                        {pending.length} pendiente{pending.length !== 1 ? "s" : ""}
                        {overdueCount > 0 && (
                          <span style={{ color: C.danger }}>
                            {" · "}{overdueCount} vencida{overdueCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setModal({ mode: "create" })}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 16px", borderRadius: 8,
                      background: C.accent, color: "#0d1117",
                      fontWeight: 700, fontSize: 13, border: "none",
                      cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
                    }}
                  >
                    <Plus size={14} /> Nueva tarea
                  </button>
                </div>

                {pending.length === 0 ? (
                  <EmptyState icon="✅" title="¡Todo al día!" sub="No tenés tareas pendientes. ¡Bien hecho!" />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {pending.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onToggle={handleToggle}
                        onEdit={(task) => setModal({ mode: "edit", task })}
                        onDelete={(task) => setToDelete(task)}
                        readOnly={false}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Vista: Historial */}
            {view === "history" && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "Syne, sans-serif", lineHeight: 1 }}>
                    Historial
                  </h1>
                  <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                    {completed.length} tarea{completed.length !== 1 ? "s" : ""} completada{completed.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {completed.length === 0 ? (
                  <EmptyState icon="📋" title="Sin historial todavía" sub="Las tareas que completes aparecerán acá" />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {completed.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onToggle={handleToggle}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        readOnly={true}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* ── Modales */}
      {modal && (
        <TaskModal
          task={modal.task}
          userId={user.id}
          onClose={() => setModal(null)}
          onDone={loadTasks}
        />
      )}
      {toDelete && (
        <DeleteConfirm
          task={toDelete}
          onClose={() => setToDelete(null)}
          onDone={loadTasks}
        />
      )}
    </div>
  );
}