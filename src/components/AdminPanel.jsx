import { useCallback, useEffect, useState } from "react";
import { ListTodo, Shield, UserRound, Users } from "lucide-react";
import { adminApi } from "../api.js";
import { C } from "../constants.js";
import { Alert, EmptyState } from "./ui.jsx";
import { TaskCard } from "./TaskCard.jsx";

async function readError(response, fallback) {
  const body = await response.json().catch(() => null);
  return body?.message || fallback;
}

function formatDate(date) {
  if (!date) {
    return "Sin fecha";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Pagination({ page, totalPages, label, onPrevious, onNext }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginTop: 16,
      }}
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={page === 0}
        style={{
          padding: "7px 11px",
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          background: page === 0 ? C.surf : C.surf2,
          color: page === 0 ? C.dim : C.text,
          cursor: page === 0 ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          fontWeight: 600,
        }}
      >
        Anterior
      </button>

      <span style={{ fontSize: 12, color: C.muted }}>
        {label} {page + 1} de {totalPages}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={page >= totalPages - 1}
        style={{
          padding: "7px 11px",
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          background: page >= totalPages - 1 ? C.surf : C.surf2,
          color: page >= totalPages - 1 ? C.dim : C.text,
          cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          fontWeight: 600,
        }}
      >
        Siguiente
      </button>
    </div>
  );
}

export function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [usersTotalElements, setUsersTotalElements] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [tasksPage, setTasksPage] = useState(0);
  const [tasksTotalPages, setTasksTotalPages] = useState(0);
  const [tasksTotalElements, setTasksTotalElements] = useState(0);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  const loadUsers = useCallback(async (pageToLoad) => {
    const safePage = Math.max(Number(pageToLoad) || 0, 0);

    try {
      setUsersLoading(true);
      setUsersError(null);

      const response = await adminApi.getUsers(safePage);

      if (!response.ok) {
        throw new Error(
          await readError(response, "No se pudo cargar la lista de usuarios")
        );
      }

      const data = await response.json();

      setUsers(data.content ?? []);
      setUsersPage(data.number ?? safePage);
      setUsersTotalPages(data.totalPages ?? 0);
      setUsersTotalElements(data.totalElements ?? 0);
    } catch (error) {
      setUsersError(
        error instanceof Error ? error.message : "Ocurrió un error inesperado"
      );
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(usersPage);
  }, [usersPage, loadUsers]);

  useEffect(() => {
    if (selectedUserId == null) {
      setSelectedUser(null);
      setUserError(null);
      return;
    }

    let active = true;

    const loadUser = async () => {
      try {
        setUserLoading(true);
        setUserError(null);
        setSelectedUser(null);

        const response = await adminApi.getUser(selectedUserId);

        if (!response.ok) {
          throw new Error(
            await readError(response, "No se pudo cargar el usuario")
          );
        }

        const data = await response.json();

        if (active) {
          setSelectedUser(data);
        }
      } catch (error) {
        if (active) {
          setUserError(
            error instanceof Error
              ? error.message
              : "Ocurrió un error inesperado"
          );
        }
      } finally {
        if (active) {
          setUserLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [selectedUserId]);

  useEffect(() => {
    if (selectedUserId == null) {
      setTasks([]);
      setTasksPage(0);
      setTasksTotalPages(0);
      setTasksTotalElements(0);
      setTasksError(null);
      return;
    }

    let active = true;

    const loadTasks = async () => {
      try {
        setTasksLoading(true);
        setTasksError(null);
        setTasks([]);

        const response = await adminApi.getTasksByUser(
          selectedUserId,
          tasksPage
        );

        if (!response.ok) {
          throw new Error(
            await readError(response, "No se pudieron cargar las tareas")
          );
        }

        const data = await response.json();

        if (active) {
          setTasks(data.content ?? []);
          setTasksPage(data.number ?? tasksPage);
          setTasksTotalPages(data.totalPages ?? 0);
          setTasksTotalElements(data.totalElements ?? 0);
        }
      } catch (error) {
        if (active) {
          setTasksError(
            error instanceof Error
              ? error.message
              : "Ocurrió un error inesperado"
          );
        }
      } finally {
        if (active) {
          setTasksLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      active = false;
    };
  }, [selectedUserId, tasksPage]);

  const selectUser = (userId) => {
    setSelectedUserId(userId);
    setTasksPage(0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Shield size={22} color={C.accent} />
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "Syne, sans-serif",
              lineHeight: 1,
            }}
          >
            Administración
          </h1>
        </div>

        <p style={{ fontSize: 13, color: C.muted, marginTop: 7 }}>
          Consultá usuarios y sus tareas mediante los endpoints protegidos de
          administración.
        </p>
      </div>

      <Alert msg={usersError} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <section
          style={{
            flex: "1 1 280px",
            minWidth: 0,
            background: C.surf,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={17} color={C.accent} />
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Usuarios</h2>
            </div>

            <span style={{ fontSize: 12, color: C.muted }}>
              {usersTotalElements} total
            </span>
          </div>

          {usersLoading ? (
            <EmptyState
              icon="⏳"
              title="Cargando usuarios..."
              sub="Consultando /admin/users"
            />
          ) : users.length === 0 ? (
            <EmptyState
              icon="👤"
              title="Sin usuarios"
              sub="No hay usuarios en esta página"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {users.map((listedUser) => {
                const selected = listedUser.id === selectedUserId;

                return (
                  <button
                    type="button"
                    key={listedUser.id}
                    onClick={() => selectUser(listedUser.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "11px 12px",
                      borderRadius: 9,
                      border: `1px solid ${
                        selected ? C.accent : C.borderL
                      }`,
                      background: selected ? C.surf2 : C.bg,
                      color: C.text,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {listedUser.nickname || "Sin nickname"}
                      </span>

                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: ".05em",
                          color:
                            listedUser.role === "ADMIN" ? C.accent : C.muted,
                        }}
                      >
                        {listedUser.role ?? "USER"}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: 12,
                        color: C.muted,
                        marginTop: 3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {listedUser.email}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <Pagination
            page={usersPage}
            totalPages={usersTotalPages}
            label="Página"
            onPrevious={() =>
              setUsersPage((current) => Math.max(current - 1, 0))
            }
            onNext={() =>
              setUsersPage((current) =>
                Math.min(current + 1, usersTotalPages - 1)
              )
            }
          />
        </section>

        <section
          style={{
            flex: "2 1 420px",
            minWidth: 0,
            background: C.surf,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 16,
          }}
        >
          {selectedUserId == null ? (
            <EmptyState
              icon="👈"
              title="Seleccioná un usuario"
              sub="Podrás ver su perfil y sus tareas"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Alert msg={userError} />

              {userLoading ? (
                <EmptyState
                  icon="⏳"
                  title="Cargando perfil..."
                  sub="Consultando /admin/users/{userId}"
                />
              ) : selectedUser ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    paddingBottom: 16,
                    borderBottom: `1px solid ${C.borderL}`,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: C.surf2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: C.accent,
                      flexShrink: 0,
                    }}
                  >
                    <UserRound size={19} />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <h2 style={{ fontSize: 17, fontWeight: 700 }}>
                        {selectedUser.nickname || "Sin nickname"}
                      </h2>

                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: ".05em",
                          padding: "3px 7px",
                          borderRadius: 999,
                          color:
                            selectedUser.role === "ADMIN" ? C.accent : C.muted,
                          background: C.surf2,
                        }}
                      >
                        {selectedUser.role ?? "USER"}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                      {selectedUser.email}
                    </p>
                    <p style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>
                      ID {selectedUser.id} · Nacimiento: {formatDate(
                        selectedUser.dateOfBirth
                      )}
                    </p>
                  </div>
                </div>
              ) : null}

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ListTodo size={17} color={C.accent} />
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>Tareas</h3>
                  </div>

                  <span style={{ fontSize: 12, color: C.muted }}>
                    {tasksTotalElements} total
                  </span>
                </div>

                <Alert msg={tasksError} />

                {tasksLoading ? (
                  <EmptyState
                    icon="⏳"
                    title="Cargando tareas..."
                    sub="Consultando /admin/tasks/{userId}"
                  />
                ) : tasks.length === 0 ? (
                  <EmptyState
                    icon="📋"
                    title="Sin tareas"
                    sub="Este usuario no tiene tareas en esta página"
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={() => {}}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        readOnly={true}
                        disableToggle={true}
                      />
                    ))}
                  </div>
                )}

                <Pagination
                  page={tasksPage}
                  totalPages={tasksTotalPages}
                  label="Página"
                  onPrevious={() =>
                    setTasksPage((current) => Math.max(current - 1, 0))
                  }
                  onNext={() =>
                    setTasksPage((current) =>
                      Math.min(current + 1, tasksTotalPages - 1)
                    )
                  }
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
