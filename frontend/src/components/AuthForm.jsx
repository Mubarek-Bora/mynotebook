import { useState } from "react";
import { login, register } from "../services/api";

export default function AuthForm({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn = mode === "login" ? login : register;
      const data = await fn(email, password);
      onAuthed(data.access_token, data.user_email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="brand-mark brand-mark--center">
          <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
            <rect x="2" y="2" width="60" height="60" rx="16" fill="#2d1b45" />
            <rect x="16" y="14" width="32" height="36" rx="3" fill="#f7f4ec" />
            <rect x="16" y="14" width="6" height="36" rx="2" fill="#d9a441" />
            <line x1="27" y1="24" x2="42" y2="24" stroke="#8b8478" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="27" y1="31" x2="42" y2="31" stroke="#8b8478" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="27" y1="38" x2="38" y2="38" stroke="#8b8478" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <h1 className="brand">MyNotebook</h1>
        </div>
        <p className="tagline">Write it down. Find it by meaning, not just keywords.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          className="link-button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
