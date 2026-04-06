import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { C } from "../constants";
import { BASE, http } from "../api";
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

      const user = await res.json();
      onLogin(user); // sube el usuario al componente raíz (App.jsx)
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