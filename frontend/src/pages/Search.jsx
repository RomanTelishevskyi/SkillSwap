import React, { useState } from "react";
import api from "../api/client";

export default function Search() {
  const [wantSkill, setWantSkill] = useState("");
  const [offerSkill, setOfferSkill] = useState("");
  const [minLevel, setMinLevel] = useState(1);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const search = async () => {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("wantSkill", wantSkill);
      if (offerSkill.trim()) params.set("offerSkill", offerSkill);
      params.set("minLevel", String(minLevel));

      const res = await api.get(`/api/search/users?${params.toString()}`);
      setResults(res.data || []);
      if ((res.data || []).length === 0)
        setMsg("No matches yet. Try different skills.");
    } catch (e) {
      setErr(e?.response?.data?.message || "Search failed (skill not found?)");
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (toUsername) => {
    setErr("");
    setMsg("");
    try {
      const res = await api.post("/api/friends/request", { toUsername });
      setMsg(res.data?.message || "Request sent");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send friend request");
    }
  };

  return (
    <div className="card">
      <div className="flex-between">
        <div>
          <h2 style={{ margin: 0 }}>Search skills</h2>
          <div className="text-muted mt-2">
            Find people to learn with. Top results are best “swap matches”.
          </div>
        </div>
        <div className="text-muted" style={{ fontSize: 13 }}>
          Logged as @{localStorage.getItem("username")}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex">
          <div style={{ flex: 2 }}>
            <label>I want to learn</label>
            <input
              value={wantSkill}
              onChange={(e) => setWantSkill(e.target.value)}
              placeholder="Piano, Guitar, SQL..."
            />
          </div>

          <div style={{ flex: 2 }}>
            <label>I can offer</label>
            <input
              value={offerSkill}
              onChange={(e) => setOfferSkill(e.target.value)}
              placeholder="English, Java, Design..."
            />
          </div>

          <div style={{ flex: 1 }}>
            <label>Min level</label>
            <select
              value={minLevel}
              onChange={(e) => setMinLevel(Number(e.target.value))}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex">
          <button
            className="btn"
            onClick={search}
            disabled={loading || !wantSkill.trim()}
            style={{ minWidth: 180 }}
          >
            {loading ? "Searching..." : "Search"}
          </button>

          <button
            className="btn secondary"
            onClick={() => {
              setResults([]);
              setErr("");
              setMsg("");
            }}
          >
            Clear
          </button>
        </div>

        {err && (
          <div
            className="mt-4"
            style={{
              border: "1px solid rgba(239,68,68,0.35)",
              background: "rgba(239,68,68,0.08)",
              padding: "10px 12px",
              borderRadius: 12,
            }}
          >
            {err}
          </div>
        )}

        {msg && (
          <div
            className="mt-4"
            style={{
              border: "1px solid rgba(34,197,94,0.35)",
              background: "rgba(34,197,94,0.08)",
              padding: "10px 12px",
              borderRadius: 12,
            }}
          >
            {msg}
          </div>
        )}
      </div>

      <div className="mt-6">
        {results.length === 0 ? (
          <div className="text-muted">Results will appear here.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {results.map((u, idx) => (
              <div key={idx} className="card" style={{ padding: 16 }}>
                <div className="flex-between">
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>
                      {u.firstName} {u.lastName}{" "}
                      <span className="text-muted" style={{ fontWeight: 500 }}>
                        @{u.username}
                      </span>
                    </div>

                    <div
                      className="text-muted"
                      style={{ marginTop: 6, fontSize: 13 }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 10px",
                          borderRadius: 999,
                          border: "1px solid rgba(20,184,166,0.25)",
                          background: "rgba(20,184,166,0.08)",
                          marginRight: 8,
                        }}
                      >
                        score {u.score}
                      </span>
                      {u.reason}
                    </div>
                  </div>

                  <div className="flex">
                    <button
                      className="btn"
                      onClick={() => sendFriendRequest(u.username)}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Add friend
                    </button>

                    <button
                      className="btn secondary"
                      onClick={() => (window.location.hash = "#/chat")}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Open chats
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-muted" style={{ fontSize: 12 }}>
        Note: your search works best after you add your own skills in Profile.
      </div>
    </div>
  );
}
