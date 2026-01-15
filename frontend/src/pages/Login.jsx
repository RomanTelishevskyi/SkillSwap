import React, { useState } from "react";
import api from "../api/client";

export default function Login({ onAuth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);

      onAuth?.();
      window.location.hash = "#/search";
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center" style={{ minHeight: "70vh" }}>
      <div className="card" style={{ width: 420 }}>
        <div className="flex-between">
          <h2 style={{ margin: 0 }}>Welcome back</h2>
          <span className="text-muted" style={{ fontSize: 13 }}>
            Skill Swap
          </span>
        </div>

        <p className="text-muted" style={{ marginTop: 6 }}>
          Login to search skills, add friends and chat.
        </p>

        <form onSubmit={submit} className="mt-4">
          <div className="mt-2">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. anna"
              autoComplete="username"
            />
          </div>

          <div className="mt-4">
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div
              className="mt-4"
              style={{
                border: "1px solid rgba(239,68,68,0.35)",
                background: "rgba(239,68,68,0.08)",
                padding: "10px 12px",
                borderRadius: 12,
              }}
            >
              {error}
            </div>
          )}

          <div className="mt-6 flex">
            <button
              className="btn"
              type="submit"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <button
              type="button"
              className="btn secondary"
              onClick={() => (window.location.hash = "#/register")}
              style={{ width: 140 }}
            >
              Register
            </button>
          </div>
        </form>

        <div className="mt-4 text-muted" style={{ fontSize: 12 }}>
          Tip: username is stored lowercase (anna, not Anna).
        </div>
      </div>
    </div>
  );
}
