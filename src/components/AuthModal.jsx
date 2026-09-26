import React, { useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";

const roleDescriptions = {
  CUSTOMER: "Browse, save, and inquire about properties",
  AGENT: "List, manage properties and handle leads",
  OWNER: "List your own properties for sale or rent",
};

export default function AuthModal({ onClose, onAuth }) {
  const [tab, setTab] = useState("login"); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "CUSTOMER",
  });

  const update = (key, val) => {
    setError("");
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = tab === "login"
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, name: form.name, phone: form.phone, role: form.role };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      onAuth(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
          animation: "slideInUp 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "28px 28px 0", position: "relative" }}>
          <button
            onClick={onClose}
            style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
          >
            <X size={20} />
          </button>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
            <div style={{ width: "32px", height: "32px", background: "var(--accent)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: "0.85rem" }}>E</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>EstateX</span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "12px", padding: "4px" }}>
            {["login", "register"].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "none",
                  borderRadius: "9px",
                  background: tab === t ? "#ffffff" : "transparent",
                  color: tab === t ? "#0f172a" : "#64748b",
                  fontWeight: tab === t ? 700 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>

          {tab === "register" && (
            <>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "0.88rem", outline: "none", transition: "border 0.2s", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>I am a...</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {["CUSTOMER", "AGENT", "OWNER"].map(r => (
                    <label
                      key={r}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        padding: "10px 12px",
                        border: `1.5px solid ${form.role === r ? "var(--accent)" : "#e2e8f0"}`,
                        borderRadius: "10px",
                        cursor: "pointer",
                        background: form.role === r ? "rgba(37,99,235,0.04)" : "#ffffff",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r}
                        checked={form.role === r}
                        onChange={() => update("role", r)}
                        style={{ marginTop: "2px", accentColor: "var(--accent)" }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#0f172a" }}>{r.charAt(0) + r.slice(1).toLowerCase()}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "1px" }}>{roleDescriptions[r]}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Email Address *</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={e => update("email", e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Password *</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={tab === "register" ? 8 : 1}
                placeholder={tab === "register" ? "Minimum 8 characters" : "Your password"}
                value={form.password}
                onChange={e => update("password", e.target.value)}
                style={{ width: "100%", padding: "10px 44px 10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "0.8rem", color: "#dc2626" }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "var(--accent)",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {tab === "login" ? "Sign In" : "Create Account"}
          </button>

          {tab === "login" && (
            <div style={{ textAlign: "center", fontSize: "0.78rem", color: "#64748b" }}>
              Don't have an account?{" "}
              <span onClick={() => setTab("register")} style={{ color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}>
                Register here
              </span>
            </div>
          )}

          {/* Demo accounts shortcut */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", textAlign: "center", marginBottom: "8px", fontWeight: 600 }}>DEMO ACCOUNTS</div>
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { label: "Buyer", email: "buyer@estatex.com", password: "customer123" },
                { label: "Agent", email: "agent@estatex.com", password: "agent123" },
                { label: "Admin", email: "admin@estatex.com", password: "admin123" },
              ].map(acc => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => { setTab("login"); setForm(prev => ({ ...prev, email: acc.email, password: acc.password })); }}
                  style={{ flex: 1, padding: "6px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", fontSize: "0.7rem", fontWeight: 600, color: "#475569", cursor: "pointer" }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
