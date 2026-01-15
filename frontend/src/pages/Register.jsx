import React, { useState } from "react";
import api from "../api/client";

export default function Register({ onAuth }) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", {
        username,
        firstName,
        lastName,
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
        "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center" style={{ minHeight: "70vh" }}>
      <div className="card" style={{ width: 520 }}>
        <div className="flex-between">
          <h2 style={{ margin: 0 }}>Create account</h2>
          <span className="text-muted" style={{ fontSize: 13 }}>
            Skill Swap
          </span>
        </div>

        <p className="text-muted" style={{ marginTop: 6 }}>
          Register to build your profile and start swapping skills.
        </p>

        <form onSubmit={submit} className="mt-4">
          <div className="flex">
            <div style={{ flex: 1 }}>
              <label>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. anna"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="flex mt-4">
            <div style={{ flex: 1 }}>
              <label>First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Anna"
                autoComplete="given-name"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="mt-4">
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="min 6 characters"
              type="password"
              autoComplete="new-password"
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
              {loading ? "Creating..." : "Create account"}
            </button>

            <button
              type="button"
              className="btn secondary"
              onClick={() => (window.location.hash = "#/login")}
              style={{ width: 140 }}
            >
              Login
            </button>
          </div>
        </form>

        <div className="mt-4 text-muted" style={{ fontSize: 12 }}>
          After registration you’ll be redirected to Search.
        </div>
      </div>
    </div>
  );
}
