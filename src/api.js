// URL base del backend. Si cambiás el puerto en Spring, cambialo acá.
export const BASE = "http://localhost:8080";
 
// Cliente HTTP centralizado.
// Cada método envuelve fetch con los headers y método correctos,
// para no repetir esa lógica en cada componente.
export const http = {
  get:   (url)       => fetch(url),
  post:  (url, body) => fetch(url, { method: "POST",  headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  put:   (url, body) => fetch(url, { method: "PUT",   headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  patch: (url, body) => fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  del:   (url)       => fetch(url, { method: "DELETE" }),
};
 