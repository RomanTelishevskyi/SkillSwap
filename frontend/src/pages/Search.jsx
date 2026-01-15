import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function Search() {
  const [wantSkill, setWantSkill] = useState("");
  const [offerSkill, setOfferSkill] = useState("");
  const [minLevel, setMinLevel] = useState(1);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // friends / requests state
  const [friendsSet, setFriendsSet] = useState(new Set());
  const [outgoingSet, setOutgoingSet] = useState(new Set());
  const [incoming, setIncoming] = useState([]);

  const loadSocial = async () => {
    try {
      const [friendsRes, outRes, inRes] = await Promise.all([
        api.get("/api/friends/list"),
        api.get("/api/friends/requests/outgoing"),
        api.get("/api/friends/requests/incoming"),
      ]);

      const friends = friendsRes.data || [];
      setFriendsSet(new Set(friends.map((f) => (f.username || "").toLowerCase())));

      const outgoing = outRes.data || [];
      // outgoing DTO содержит from/to usernames; нам нужен "to"
      setOutgoingSet(new Set(outgoing.map((r) => (r.toUsername || "").toLowerCase())));

      setIncoming(inRes.data || []);
    } catch {
      // не ломаем страницу поиска, если social не загрузился
    }
  };

  useEffect(() => {
    loadSocial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = async () => {
    setErr("");
    setMsg("");
    setLoading(true);
   try {
    const params = new URLSearchParams();
    params.set("wantSkill", wantSkill.trim());
    if (offerSkill.trim()) params.set("offerSkill", offerSkill.trim());
    params.set("minLevel", String(minLevel));

    const res = await api.get(`/api/search/users?${params.toString()}`);
    setResults(res.data || []);
    if ((res.data || []).length === 0) {
      setMsg("No matches yet. Try different skills.");
    }
  } catch (e) {
    // если скилл не найден в БД — бекенд кидает IllegalArgumentException
    setErr(e?.response?.data?.message || "Search failed (skill not found?)");
  } finally {
    setLoading(false);
  }
};


  const sendFriendRequest = async (toUsername) => {
    setErr("");
    setMsg("");
    try {
      await api.post("/api/friends/request", { toUsername });
      setMsg(`Friend request sent to @${toUsername}`);
      await loadSocial();
    } catch (e) {
      setErr(e?.response?.data?.error || e?.response?.data?.message || "Failed to send request");
    }
  };

  const acceptRequest = async (requestId) => {
    setErr("");
    setMsg("");
    try {
      await api.post(`/api/friends/requests/${requestId}/accept`);
      setMsg("Friend request accepted");
      await loadSocial();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to accept request");
    }
  };

  const rejectRequest = async (requestId) => {
    setErr("");
    setMsg("");
    try {
      await api.post(`/api/friends/requests/${requestId}/reject`);
      setMsg("Friend request rejected");
      await loadSocial();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to reject request");
    }
  };

  const startChat = async (username) => {
    setErr("");
    setMsg("");
    try {
      // создаёт/возвращает чат ТОЛЬКО если вы друзья (backend уже проверяет)
      const res = await api.post(`/api/chat/with/${encodeURIComponent(username)}`);
      const chatId = res.data?.chatId;
      if (!chatId) throw new Error("No chatId returned");

      // открываем чат с конкретным chatId
      window.location.hash = `#/chat?chatId=${chatId}`;
    } catch (e) {
      const status = e?.response?.status;
      if (status === 403) {
        setErr("You can chat only after you become friends (accepted request).");
      } else {
        setErr(e?.response?.data?.error || e?.response?.data?.message || "Failed to open chat");
      }
    }
  };

  return (
    <div className="container">
      <div className="panel">
        <div className="h1">Find Skill Swap partners</div>
        <div className="text-muted mt-2">
          Search users by what you want to learn and what you can offer.
        </div>

        {/* Incoming requests */}
        {incoming.length > 0 && (
          <div className="panel mt-4" style={{ padding: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Incoming friend requests</div>
            <div className="text-muted" style={{ fontSize: 13, marginBottom: 10 }}>
              Accept → you become friends and can start a chat.
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {incoming.map((r) => (
                <div
                  key={r.id}
                  className="panel"
                  style={{
                    padding: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800 }}>@{r.fromUsername}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      status: {r.status}
                    </div>
                  </div>
                  <div className="flex" style={{ gap: 8 }}>
                    <button className="btn" onClick={() => acceptRequest(r.id)}>
                      Accept
                    </button>
                    <button className="btn secondary" onClick={() => rejectRequest(r.id)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {err && <div className="alert mt-4">{err}</div>}
        {msg && <div className="ok mt-4">{msg}</div>}

        <div className="flex mt-4" style={{ gap: 12, alignItems: "end" }}>
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
            <input
              type="number"
              min={1}
              max={5}
              value={minLevel}
              onChange={(e) => setMinLevel(e.target.value)}
            />
          </div>

          <button className="btn" onClick={search} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="mt-5">
          {results.length > 0 && (
            <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 12 }}>
              {results.map((u) => {
                const uname = (u.username || "").toLowerCase();
                const isFriend = friendsSet.has(uname);
                const isOutgoingPending = outgoingSet.has(uname);

                return (
                  <div key={u.username} className="panel" style={{ padding: 14 }}>
                    <div className="flex" style={{ justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>
                          {u.firstName} {u.lastName} <span className="text-muted">@{u.username}</span>
                        </div>

                        <div className="text-muted" style={{ marginTop: 6, fontSize: 13 }}>
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

                        {!!u.match && (
                          <div className="text-muted" style={{ marginTop: 8, fontSize: 13 }}>
                            <b>Match:</b> {u.match}
                          </div>
                        )}
                      </div>

                      <div className="flex" style={{ gap: 10, alignItems: "center" }}>
                        {!isFriend && (
                          <button
                            className="btn"
                            onClick={() => sendFriendRequest(u.username)}
                            disabled={isOutgoingPending}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {isOutgoingPending ? "Request sent" : "Add friend"}
                          </button>
                        )}

                        {isFriend && (
                          <button
                            className="btn"
                            onClick={() => startChat(u.username)}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            Start chat
                          </button>
                        )}

                        {!isFriend && (
                          <button
                            className="btn secondary"
                            onClick={() => (window.location.hash = "#/chat")}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            Open chats
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 text-muted" style={{ fontSize: 12 }}>
          Note: your search works best after you add your own skills in Profile.
        </div>
      </div>
    </div>
  );
}
