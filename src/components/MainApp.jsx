import { useCallback, useEffect, useState } from "react";
import { LogOut, Plus } from "lucide-react";
import { BASE, http } from "../api.js";
import { C, PORDER } from "../constants.js";
import { AdminPanel } from "./AdminPanel.jsx";
import { DeleteConfirm } from "./DeleteConfirm.jsx";
import { HolidaysPanel } from "./HolidaysPanel.jsx";
import { TaskCard } from "./TaskCard.jsx";
import { TaskModal } from "./TaskModal.jsx";
import { Alert, EmptyState } from "./ui.jsx";

// Vista principal de la app para usuarios autenticados.
export function MainApp({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("tasks");
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const isAdmin = user?.role === "ADMIN";
  const isTaskView = view === "tasks" || view === "history";

  const loadTasks = useCallback(async (pageToLoad) => {
    const safePage = Math.max(Number(pageToLoad) || 0, 0);

    try {
      setLoading(true);
      setError(null);

      const response = await http.get(`${BASE}/tasks?page=${safePage}`);

      if (!response.ok) {
        throw new Error("No se pudieron cargar las tareas");
      }

      const data = await response.json();

      // Compatibilidad temporal con una respuesta antigua de tipo List.
      if (Array.isArray(data)) {
        setTasks(data);
        setPage(0);
        setTotalPages(data.length > 0 ? 1 : 0);
        setTotalElements(data.length);
        return;
      }

      setTasks(data.content ?? []);
      setPage(data.number ?? safePage);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Ocurrió un error inesperado"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.token) {
      return;
    }

    loadTasks(page);
  }, [user?.token, page, loadTasks]);

  useEffect(() => {
    if (!isAdmin && view === "admin") {
      setView("tasks");
    }
  }, [isAdmin, view]);

  const handleToggle = async (task) => {
    try {
      setError(null);

      const response = await http.patch(`${BASE}/tasks/${task.id}/complete`, {
        completed: !task.completed,
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar la tarea");
      }

      await loadTasks(page);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Ocurrió un error inesperado"
      );
    }
  };

  const goToPreviousPage = () => {
    setPage((currentPage) => Math.max(currentPage - 1, 0));
  };

  const goToNextPage = () => {
    setPage((currentPage) => {
      if (totalPages <= 0) {
        return 0;
      }

      return Math.min(currentPage + 1, totalPages - 1);
    });
  };

  const pending = tasks
    .filter((task) => !task.completed)
    .sort(
      (first, second) =>
        PORDER[first.priority] - PORDER[second.priority] ||
        (first.dateLimit || "").localeCompare(second.dateLimit || "")
    );

  const completed = tasks
    .filter((task) => task.completed)
    .sort(
      (first, second) =>
        new Date(second.completedAt || 0) - new Date(first.completedAt || 0)
    );

  const overdueCount = pending.filter(
    (task) => task.dateLimit && new Date(task.dateLimit) < new Date()
  ).length;

  const tabs = [
    { id: "tasks", label: "Pendientes", count: pending.length },
    { id: "history", label: "Historial", count: completed.length },
    { id: "holidays", label: "Feriados", count: "AR" },
    ...(isAdmin
      ? [{ id: "admin", label: "Admin", count: "ADMIN" }]
      : []),
  ];

  const contentMaxWidth = view === "admin" ? 1040 : 680;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <header
        style={{
          borderBottom: `1px solid ${C.borderL}`,
          position: "sticky",
          top: 0,
          background: "rgba(13,17,23,.92)",
          backdropFilter: "blur(8px)",
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            minHeight: 54,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                background: C.accent,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0d1117"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>

            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                fontFamily: "Syne, sans-serif",
                letterSpacing: ".01em",
              }}
            >
              Taskly
            </span>
          </div>

          <nav
            style={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              padding: "8px 0",
            }}
          >
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setView(tab.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "inherit",
                  transition: "all .15s",
                  background: view === tab.id ? C.surf2 : "transparent",
                  color: view === tab.id ? C.text : C.muted,
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
                <span
                  style={{
                    marginLeft: 5,
                    fontSize: 10,
                    fontWeight: 700,
                    color: view === tab.id ? C.accent : C.dim,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ minWidth: 0, textAlign: "right" }}>
              <p
                style={{
                  fontSize: 12,
                  color: C.muted,
                  maxWidth: 150,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email}
              </p>

              {isAdmin && (
                <p
                  style={{
                    fontSize: 9,
                    color: C.accent,
                    fontWeight: 800,
                    letterSpacing: ".06em",
                    marginTop: 1,
                  }}
                >
                  ADMIN
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Cerrar sesión"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.muted,
                display: "flex",
                padding: 4,
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: contentMaxWidth,
          margin: "0 auto",
          padding: "28px 20px",
        }}
      >
        {isTaskView && (
          <>
            {loading ? (
              <EmptyState
                icon="⏳"
                title="Cargando..."
                sub="Obteniendo tus tareas"
              />
            ) : error ? (
              <div style={{ padding: "40px 0" }}>
                <Alert msg={error} />
              </div>
            ) : (
              <>
                {view === "tasks" && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                        marginBottom: 20,
                      }}
                    >
                      <div>
                        <h1
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            fontFamily: "Syne, sans-serif",
                            lineHeight: 1,
                          }}
                        >
                          Mis tareas
                        </h1>

                        {pending.length > 0 && (
                          <p
                            style={{
                              fontSize: 13,
                              color: C.muted,
                              marginTop: 4,
                            }}
                          >
                            {pending.length} pendiente
                            {pending.length !== 1 ? "s" : ""}
                            {overdueCount > 0 && (
                              <span style={{ color: C.danger }}>
                                {" · "}
                                {overdueCount} vencida
                                {overdueCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setModal({ mode: "create" })}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          borderRadius: 8,
                          background: C.accent,
                          color: "#0d1117",
                          fontWeight: 700,
                          fontSize: 13,
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        <Plus size={14} /> Nueva tarea
                      </button>
                    </div>

                    {pending.length === 0 ? (
                      <EmptyState
                        icon="✅"
                        title="¡Todo al día!"
                        sub="No tenés tareas pendientes en esta página."
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {pending.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggle={handleToggle}
                            onEdit={(selectedTask) =>
                              setModal({ mode: "edit", task: selectedTask })
                            }
                            onDelete={setToDelete}
                            readOnly={false}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {view === "history" && (
                  <>
                    <div style={{ marginBottom: 20 }}>
                      <h1
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          fontFamily: "Syne, sans-serif",
                          lineHeight: 1,
                        }}
                      >
                        Historial
                      </h1>

                      <p
                        style={{
                          fontSize: 13,
                          color: C.muted,
                          marginTop: 4,
                        }}
                      >
                        {completed.length} tarea
                        {completed.length !== 1 ? "s" : ""} completada
                        {completed.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {completed.length === 0 ? (
                      <EmptyState
                        icon="📋"
                        title="Sin historial en esta página"
                        sub="Las tareas que completes aparecerán acá"
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {completed.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
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

                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 24,
                    }}
                  >
                    <button
                      type="button"
                      onClick={goToPreviousPage}
                      disabled={page === 0}
                      style={{
                        padding: "7px 12px",
                        borderRadius: 8,
                        border: `1px solid ${C.borderL}`,
                        background: page === 0 ? C.surf : C.surf2,
                        color: page === 0 ? C.dim : C.text,
                        cursor: page === 0 ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Anterior
                    </button>

                    <span style={{ fontSize: 13, color: C.muted }}>
                      Página {page + 1} de {totalPages} · {totalElements} tarea
                      {totalElements !== 1 ? "s" : ""}
                    </span>

                    <button
                      type="button"
                      onClick={goToNextPage}
                      disabled={page >= totalPages - 1}
                      style={{
                        padding: "7px 12px",
                        borderRadius: 8,
                        border: `1px solid ${C.borderL}`,
                        background:
                          page >= totalPages - 1 ? C.surf : C.surf2,
                        color: page >= totalPages - 1 ? C.dim : C.text,
                        cursor:
                          page >= totalPages - 1
                            ? "not-allowed"
                            : "pointer",
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {view === "holidays" && <HolidaysPanel />}
        {view === "admin" && isAdmin && <AdminPanel />}
      </main>

      {modal && (
        <TaskModal
          task={modal.task}
          onClose={() => setModal(null)}
          onDone={() => loadTasks(page)}
        />
      )}

      {toDelete && (
        <DeleteConfirm
          task={toDelete}
          onClose={() => setToDelete(null)}
          onDone={() => loadTasks(page)}
        />
      )}
    </div>
  );
}
