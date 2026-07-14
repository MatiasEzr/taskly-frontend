// URL base del backend. Si cambiás el puerto en Spring, cambialo acá.
export const BASE = "https://localhost:8443";

// Helpers para manejar el token JWT en localStorage.
export const token = {
  get: () => localStorage.getItem("token"),
  set: (value) => localStorage.setItem("token", value),
  remove: () => localStorage.removeItem("token"),
};

// Arma los headers base para cada request.
// Si hay token guardado, lo agrega automáticamente en Authorization.
function authHeaders(extra = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...extra,
  };

  const jwt = token.get();

  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`;
  }

  return headers;
}

// Cliente HTTP centralizado.
export const http = {
  get: (url) => fetch(url, { headers: authHeaders() }),

  post: (url, body) =>
    fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }),

  put: (url, body) =>
    fetch(url, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }),

  patch: (url, body) =>
    fetch(url, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }),

  del: (url) =>
    fetch(url, {
      method: "DELETE",
      headers: authHeaders(),
    }),
};

export const holidayApi = {
  getByYear: (year) =>
    http.get(`${BASE}/holidays/ar?year=${encodeURIComponent(year)}`),

  getNext: () => http.get(`${BASE}/holidays/ar/next`),
};

export const adminApi = {
  getUsers: (page = 0) =>
    http.get(`${BASE}/admin/users?page=${encodeURIComponent(page)}`),

  getUser: (userId) =>
    http.get(`${BASE}/admin/users/${encodeURIComponent(userId)}`),

  getTasksByUser: (userId, page = 0) =>
    http.get(
      `${BASE}/admin/tasks/${encodeURIComponent(userId)}?page=${encodeURIComponent(page)}`
    ),
};
