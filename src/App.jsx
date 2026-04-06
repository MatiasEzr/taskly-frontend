// App.jsx — componente raíz.
// Su única responsabilidad es saber si hay un usuario autenticado o no,
// y mostrar la pantalla correcta según eso.
// Todo lo demás (tareas, modales, historial) vive en MainApp y AuthScreen.

import { useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { MainApp }    from "./components/MainApp";

export default function App() {
  // Intenta leer el usuario guardado en localStorage al iniciar.
  // Esto hace que la sesión persista al recargar la página.
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("taskly_user")) || null;
    } catch {
      return null;
    }
  });

  const handleLogin = (u) => {
    localStorage.setItem("taskly_user", JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem("taskly_user");
    setUser(null);
  };

  return user
    ? <MainApp user={user} onLogout={handleLogout} />
    : <AuthScreen onLogin={handleLogin} />;
}