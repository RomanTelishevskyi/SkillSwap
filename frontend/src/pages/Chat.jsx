import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/client";
import ChatList from "../components/ChatList";
import MessageList from "../components/MessageList";
import { Client } from "@stomp/stompjs";

export default function Chat() {
  const me = localStorage.getItem("username") || "";

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const stompRef = useRef(null);
  const subRef = useRef(null);

  const activeChat = useMemo(() => {
    return chats.find((c) => c.chatId === activeChatId) || null;
  }, [chats, activeChatId]);

  const loadChats = async () => {
    setErr("");
    try {
      const res = await api.get("/api/chat/list");
      const list = res.data || [];
      setChats(list);

      if (!activeChatId && list.length > 0) {
        setActiveChatId(list[0].chatId);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load chats");
    }
  };

  const loadMessages = async (chatId) => {
    setErr("");
    try {
      const res = await api.get(`/api/chat/${chatId}/messages`);
      setMessages(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load messages");
    }
  };

  // Init WS once
  useEffect(() => {
    setInfo("Connecting...");

    // Важно: подключаемся к фронту (5173), а Vite проксирует /ws на backend
    const wsUrl = `ws://${window.location.host}/ws`;

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},

      onConnect: () => {
        setInfo("Connected");
        // если уже выбран чат — сразу подпишемся
        if (activeChatId) {
          try {
            subRef.current?.unsubscribe?.();
          } catch {}
          subRef.current = client.subscribe(
            `/topic/chat.${activeChatId}`,
            (frame) => {
              try {
                const payload = JSON.parse(frame.body);
                setMessages((prev) => {
                  if (prev.some((m) => m.id === payload.id)) return prev;
                  return [...prev, payload];
                });
              } catch {}
            }
          );
        }
      },

      onWebSocketClose: () => setInfo("Disconnected"),
      onWebSocketError: () => setInfo("WS error"),
      onStompError: () => setInfo("STOMP error"),
    });

    client.activate();
    stompRef.current = client;

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

  // load chats on enter
  useEffect(() => {
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When active chat changes: load messages + (re)subscribe
  useEffect(() => {
    if (!activeChatId) return;

    loadMessages(activeChatId);

    // re-subscribe for new chatId
    const client = stompRef.current;
    try {
      subRef.current?.unsubscribe?.();
    } catch {}

    // если WS уже подключён — подписываемся сразу
    if (client && client.connected) {
      subRef.current = client.subscribe(
        `/topic/chat.${activeChatId}`,
        (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.id)) return prev;
              return [...prev, payload];
            });
          } catch {}
        }
      );
    }
  }, [activeChatId]);

  const send = async () => {
    setErr("");
    if (!activeChatId) return;

    const content = text.trim();
    if (!content) return;

    setText("");

    // WS first
    const client = stompRef.current;
    if (client && client.connected) {
      client.publish({
        destination: "/app/chat.send",
        headers: {
          // MVP: backend ChatWsController берёт username из этого header
          "x-username": me,
        },
        body: JSON.stringify({
          chatId: activeChatId,
          content,
        }),
      });
      return;
    }

    // REST fallback
    try {
      const res = await api.post("/api/chat/message", {
        chatId: activeChatId,
        content,
      });
      setMessages((prev) => [...prev, res.data]);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send message");
    }
  };

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
        <button className="btn secondary" onClick={loadChats}>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          minHeight: 520,
        }}
      >
        {/* Left: chat list */}
        <div style={{ borderRight: "1px solid rgba(30,41,59,0.8)" }}>
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelect={(id) => setActiveChatId(id)}
          />
        </div>

        {/* Right: messages */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              padding: 14,
              borderBottom: "1px solid rgba(30,41,59,0.8)",
              background: "rgba(15,23,42,0.55)",
            }}
          >
            {activeChat ? (
              <div>
                <div style={{ fontWeight: 800 }}>
                  {activeChat.withFirstName} {activeChat.withLastName}{" "}
                  <span className="text-muted" style={{ fontWeight: 500 }}>
                    @{activeChat.withUsername}
                  </span>
                </div>
                <div
                  className="text-muted"
                  style={{ fontSize: 12, marginTop: 3 }}
                >
                  chatId: {activeChat.chatId}
                </div>
              </div>
            ) : (
              <div className="text-muted">
                No chats yet. Add friends and open a chat.
              </div>
            )}
          </div>

          <div style={{ flex: 1, padding: 14, overflow: "auto" }}>
            <MessageList me={me} messages={messages} />
          </div>

          <div
            style={{
              padding: 14,
              borderTop: "1px solid rgba(30,41,59,0.8)",
              background: "rgba(15,23,42,0.55)",
            }}
          >
            <div className="flex">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  activeChatId ? "Type a message..." : "Select a chat first"
                }
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
              WS sends to <b>/app/chat.send</b>, listens on{" "}
              <b>/topic/chat.&lt;chatId&gt;</b>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
