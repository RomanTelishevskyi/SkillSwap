import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/client";
import ChatList from "../components/ChatList";
import MessageList from "../components/MessageList";
import { Client } from "@stomp/stompjs";

export default function Chat() {
  const me = localStorage.getItem("username") || "";

  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendQuery, setFriendQuery] = useState("");

  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const stompRef = useRef(null);
  const subRef = useRef(null);

  // Если пришли как #/chat?chatId=123 — сразу выбираем чат
  useEffect(() => {
    const hash = window.location.hash || "";
    const q = hash.split("?")[1];
    if (!q) return;

    const sp = new URLSearchParams(q);
    const cid = sp.get("chatId");
    if (cid) {
      const n = Number(cid);
      if (!Number.isNaN(n)) setActiveChatId(n);
    }
  }, []);

  const activeChat = useMemo(() => {
    return chats.find((c) => c.chatId === activeChatId) || null;
  }, [chats, activeChatId]);

  const loadChats = async () => {
    try {
      const res = await api.get("/api/chat/list");
      const list = res.data || [];
      setChats(list);

      // не перетираем chatId из URL, но если его нет — выберем первый чат
      if (!activeChatId && list.length > 0) {
        setActiveChatId(list[0].chatId);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load chats");
    }
  };

  const loadFriends = async () => {
    try {
      const res = await api.get("/api/friends/list");
      setFriends(res.data || []);
    } catch (e) {
      // не критично
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const res = await api.get(`/api/chat/${chatId}/messages`);
      setMessages(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load messages");
    }
  };

  // Инициализация WebSocket (STOMP) один раз
  useEffect(() => {
    setErr("");
    setInfo("Connecting...");

    const wsBase = import.meta.env.VITE_WS_URL || `ws://${window.location.host}`;
    const wsUrl = wsBase.endsWith("/ws") ? wsBase : `${wsBase}/ws`;

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: { "x-username": me },

      onConnect: () => {
        stompRef.current = client;
        setInfo("Connected");

        // если уже выбран чат — подписываемся
        if (activeChatId) {
          try {
            subRef.current?.unsubscribe?.();
          } catch {}
          subRef.current = client.subscribe(`/topic/chat.${activeChatId}`, (frame) => {
            try {
              const payload = JSON.parse(frame.body);
              setMessages((prev) => {
                if (prev.some((m) => m.id === payload.id)) return prev;
                return [...prev, payload];
              });
            } catch {}
          });
        }
      },

      onStompError: (frame) => {
        setInfo(`Error: ${frame?.headers?.message || "stomp error"}`);
      },

      onWebSocketClose: () => setInfo("Disconnected"),
    });

    client.activate();

    loadChats();
    loadFriends();

    return () => {
      try {
        subRef.current?.unsubscribe?.();
      } catch {}
      try {
        client.deactivate();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Когда меняется activeChatId — подгружаем сообщения и пересабскрайб
  useEffect(() => {
    if (!activeChatId) return;

    loadMessages(activeChatId);

    const client = stompRef.current;
    if (!client || !client.connected) return;

    try {
      subRef.current?.unsubscribe?.();
    } catch {}

    subRef.current = client.subscribe(`/topic/chat.${activeChatId}`, (frame) => {
      try {
        const payload = JSON.parse(frame.body);
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
      } catch {}
    });
  }, [activeChatId]);

  // ✅ ВОТ ЭТО ГЛАВНОЕ: создать/открыть чат с другом (backend: POST /api/chat/with/{username})
  const startChatWithFriend = async (username) => {
    setErr("");
    try {
      const res = await api.post(`/api/chat/with/${encodeURIComponent(username)}`);
      const chatId = res.data?.chatId;
      if (!chatId) throw new Error("No chatId returned");

      // обновим список чатов, чтобы он появился слева
      await loadChats();

      // выбрать чат и сохранить в URL
      setActiveChatId(chatId);
      window.location.hash = `#/chat?chatId=${chatId}`;
    } catch (e) {
      const status = e?.response?.status;
      if (status === 403) {
        setErr("You can chat only with friends (make sure request is accepted).");
      } else {
        setErr(e?.response?.data?.error || e?.response?.data?.message || "Failed to start chat");
      }
    }
  };

  const send = async () => {
    const content = text.trim();
    if (!content || !activeChatId) return;

    setText("");
    setErr("");

    const client = stompRef.current;
    if (client && client.connected) {
      client.publish({
        destination: "/app/chat.send",
        headers: { "x-username": me },
        body: JSON.stringify({ chatId: activeChatId, content }),
      });
      return;
    }

    // REST fallback
    try {
      const res = await api.post("/api/chat/message", { chatId: activeChatId, content });
      if (res?.data) setMessages((prev) => [...prev, res.data]);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send message");
    }
  };

  const filteredFriends = useMemo(() => {
    const q = friendQuery.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => (f.username || "").toLowerCase().includes(q));
  }, [friends, friendQuery]);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        className="flex-between"
        style={{ padding: 18, borderBottom: "1px solid rgba(30,41,59,0.8)" }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Chats</div>
          <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
            {info ? `WebSocket: ${info}` : ""}
          </div>
        </div>
        <button className="btn secondary" onClick={() => { loadChats(); loadFriends(); }}>
          Refresh
        </button>
      </div>

      {err && (
        <div
          style={{
            margin: 14,
            border: "1px solid rgba(239,68,68,0.35)",
            background: "rgba(239,68,68,0.08)",
            padding: "10px 12px",
            borderRadius: 12,
          }}
        >
          {err}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", minHeight: 560 }}>
        {/* LEFT SIDEBAR */}
        <div style={{ borderRight: "1px solid rgba(30,41,59,0.8)" }}>
          {/* Friends */}
          <div style={{ padding: 12, borderBottom: "1px solid rgba(30,41,59,0.8)" }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Friends</div>
            <input
              value={friendQuery}
              onChange={(e) => setFriendQuery(e.target.value)}
              placeholder="Search friends by username..."
              style={{ marginBottom: 10 }}
            />
            {filteredFriends.length === 0 ? (
              <div className="text-muted" style={{ fontSize: 13 }}>
                No friends yet.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8, maxHeight: 220, overflow: "auto" }}>
                {filteredFriends.map((f) => (
                  <div
                    key={f.username}
                    className="panel"
                    style={{
                      padding: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                      {f.profilePicture ? (
                        <img
                          src={f.profilePicture}
                          alt={f.firstName}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "rgba(30,41,59,0.8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.5)",
                            flexShrink: 0,
                          }}
                        >
                          {f.firstName?.[0]?.toUpperCase() || f.lastName?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {f.firstName || ""} {f.lastName || ""}{" "}
                          <span className="text-muted">@{f.username}</span>
                        </div>
                      </div>
                    </div>
                    <button className="btn" onClick={() => startChatWithFriend(f.username)} style={{ whiteSpace: "nowrap" }}>
                      Start chat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chats list */}
          <div style={{ paddingTop: 8 }}>
            <ChatList chats={chats} activeChatId={activeChatId} onSelect={(id) => setActiveChatId(id)} />
          </div>
        </div>

        {/* RIGHT: messages */}
        <div style={{ display: "grid", gridTemplateRows: "1fr auto" }}>
          <div style={{ padding: 14, overflow: "auto" }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>
                {activeChat ? activeChat.title || `Chat #${activeChat.chatId}` : "Select a chat or start one with a friend"}
              </div>
              {activeChat?.withUsername && (
                <div className="text-muted" style={{ fontSize: 12 }}>
                  with @{activeChat.withUsername}
                </div>
              )}
            </div>

            <MessageList messages={messages} me={me} />
          </div>

          <div
            style={{
              padding: 14,
              borderTop: "1px solid rgba(30,41,59,0.8)",
              background: "rgba(2,6,23,0.35)",
            }}
          >
            <div className="flex" style={{ gap: 10 }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={activeChatId ? "Type a message..." : "Select a chat first"}
                disabled={!activeChatId}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
              />
              <button className="btn" onClick={send} disabled={!activeChatId}>
                Send
              </button>
            </div>

            <div className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
              Tip: If you just became friends, use “Start chat” in Friends to create the chat.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
