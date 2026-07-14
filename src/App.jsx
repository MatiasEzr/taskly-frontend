import { useCallback, useEffect, useState } from "react";
import { AuthScreen } from "./components/AuthScreen.jsx";
import { MainApp } from "./components/MainApp.jsx";
import { BASE, http, token } from "./api.js";

export default function App() {
  const [user, setUser] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const receivedToken = params.get("token");

    if (receivedToken) {
      const temporaryUser = { token: receivedToken };

      localStorage.setItem("taskly_user", JSON.stringify(temporaryUser));
      token.set(receivedToken);

      // Elimina el token de la URL sin recargar la página.
      window.history.replaceState({}, "", window.location.pathname);

      return temporaryUser;
    }

    try {
      const savedUser = JSON.parse(localStorage.getItem("taskly_user"));

      if (savedUser?.token) {
        token.set(savedUser.token);
      }

      return savedUser || null;
    } catch {
      localStorage.removeItem("taskly_user");
      token.remove();
      return null;
    }
  });

  const handleLogin = useCallback((authenticatedUser) => {
    localStorage.setItem("taskly_user", JSON.stringify(authenticatedUser));
    token.set(authenticatedUser.token);
    setUser(authenticatedUser);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("taskly_user");
    token.remove();
    setUser(null);
  }, []);

  /*
   * Después del login con OAuth2 inicialmente solo tenemos el JWT.
   * También actualiza sesiones antiguas guardadas antes de que el backend
   * empezara a devolver el campo role.
   */
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.token || (user?.email && user?.role)) {
        return;
      }

      try {
        const response = await http.get(`${BASE}/users/me`);

        if (!response.ok) {
          handleLogout();
          return;
        }

        const profile = await response.json();
        const fullUser = {
          ...profile,
          token: user.token,
        };

        localStorage.setItem("taskly_user", JSON.stringify(fullUser));
        setUser(fullUser);
      } catch {
        handleLogout();
      }
    };

    loadProfile();
  }, [user?.token, user?.email, user?.role, handleLogout]);

  return user ? (
    <MainApp user={user} onLogout={handleLogout} />
  ) : (
    <AuthScreen onLogin={handleLogin} />
  );
}
