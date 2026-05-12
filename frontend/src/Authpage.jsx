import { useState } from "react";
import { useAuth } from "./AuthContext";

const API = "http://localhost:8000";

export default function AuthPage({ onSuccess }) {
  const { login } = useAuth();
  const [mode, setMode]     = useState("login"); // "login" | "register"
  const [form, setForm]     = useState({ name: "", email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res  = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong");
      login(data.user, data.token);
      onSuccess?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-mark">⬡</div>
        <h1>Smart Doc Analyzer</h1>
        <p className="subtitle">
          {mode === "login" ? "Sign in to your account" : "Create a new account"}
        </p>

        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Sign In</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button>
        </div>

        <div className="auth-form">
          {mode === "register" && (
            <input
              placeholder="Full name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          )}
          <input
            placeholder="Email address"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === "Enter" && handle()}
          />

          {error && <div className="auth-error">⚠️ {error}</div>}

          <button className="auth-btn" onClick={handle} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at 50% 0%, #0d2137 0%, #0f1117 60%);
          padding: 20px;
        }
        .auth-card {
          background: #161b27;
          border: 1px solid #1e2535;
          border-radius: 20px;
          padding: 48px 40px;
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        .logo-mark { font-size: 40px; color: #6ee7b7; margin-bottom: 12px; }
        h1 { font-size: 24px; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
        .subtitle { color: #64748b; font-size: 14px; margin-bottom: 28px; }
        .auth-tabs {
          display: flex;
          background: #0f1117;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 24px;
        }
        .auth-tabs button {
          flex: 1;
          padding: 8px;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .auth-tabs button.active { background: #1e2535; color: #6ee7b7; }
        .auth-form { display: flex; flex-direction: column; gap: 12px; }
        .auth-form input {
          background: #0f1117;
          border: 1px solid #1e2535;
          color: #e2e8f0;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .auth-form input:focus { border-color: #6ee7b750; }
        .auth-form input::placeholder { color: #475569; }
        .auth-error {
          background: #2d1515;
          border: 1px solid #7f1d1d;
          color: #fca5a5;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          text-align: left;
        }
        .auth-btn {
          background: #6ee7b7;
          color: #0f1117;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 4px;
        }
        .auth-btn:hover:not(:disabled) { background: #34d399; }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}