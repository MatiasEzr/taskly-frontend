import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { C } from "../constants";
import { BASE, http, token } from "../api";
import { Field, TextInput, Btn, Alert } from "./ui";

// Pantalla de autenticación. Maneja login y registro en el mismo componente,
// alternando entre modos con el botón de la parte inferior.
export function AuthScreen({ onLogin }) {
  const [mode,    setMode]   = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [showPw,  setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Completá email y contraseña");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = mode === "login" ? `${BASE}/auth/login` : `${BASE}/auth/register`;
      const res = await http.post(url, form);

      if (!res.ok) {
        throw new Error(
          mode === "login"
            ? "Credenciales incorrectas"
            : "No se pudo crear la cuenta. El email puede estar en uso."
        );
      }

      const data = await res.json();

      // El backend devuelve un JWT tanto en login como en register.
      // Lo guardamos en localStorage en ambos casos para que el usuario
      // quede autenticado automáticamente sin tener que hacer login después de registrarse.
      if (data.token) {
        token.set(data.token);
      }

      onLogin(data); // sube el usuario al componente raíz (App.jsx)
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError(null);
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Logo y tagline */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, background: C.accent, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#0d1117" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <span style={{ fontSize: 26, fontWeight: 700, fontFamily: "Syne, sans-serif", color: C.text, letterSpacing: "-.01em" }}>
              Taskly
            </span>
          </div>
          <p style={{ fontSize: 14, color: C.muted }}>
            {mode === "login" ? "Bienvenido de vuelta" : "Empezá a organizar tu día"}
          </p>
        </div>

        {/* Formulario */}
        <div style={{
          background: C.surf, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: 28,
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <Alert msg={error} />

           {mode === "register" && (
            <Field label="Nombre">
                <TextInput
                value={form.name}
                onChange={set("name")}
                placeholder="Tu nombre"
                />
            </Field>
)}

          <Field label="Email">
            <TextInput
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="vos@ejemplo.com"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </Field>

          <Field label="Contraseña">
            <div style={{ position: "relative" }}>
              <TextInput
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                style={{ paddingRight: 42 }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex", padding: 2,
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>

          <div style={{ marginTop: 4 }}>
            <Btn onClick={handleSubmit} disabled={loading}>
              {loading ? "Cargando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </Btn>
          </div>

          {/* Botón Google — solo visible en modo login */}
          {mode === "login" && (
            <button
              onClick={() => window.location.href = "https://localhost:8443/oauth2/authorization/google"}
              style={{
                width: "100%", padding: "10px 0", borderRadius: 8, fontSize: 14,
                fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                background: "transparent", border: `1px solid ${C.border}`,
                color: C.text, display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
              }}
            >
              {/* Logo de Google en SVG — sin dependencias externas */}
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continuar con Google
            </button>
          )}

          <p style={{ textAlign: "center", fontSize: 13, color: C.muted }}>
            {mode === "login" ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
            <button
              onClick={switchMode}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: C.accent, fontWeight: 700, fontSize: 13, fontFamily: "inherit",
              }}
            >
              {mode === "login" ? "Registrate" : "Iniciá sesión"}
            </button>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: C.dim, marginTop: 20 }}>
          Taskly · Gestión de tareas personal
        </p>
      </div>
    </div>
  );
}