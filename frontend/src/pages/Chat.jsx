import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/client";
import ChatList from "../components/ChatList";
import MessageList from "../components/MessageList";
import { Client } from "@stomp/stompjs";

function extractArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content; // Spring Page
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.chats)) return data.chats;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

export default function Chat() {
  const me = localStorage.getItem("username") || "";

  // Tabs
  const [tab, setTab] = useState("private"); // private | groups

  // ===== PRIVATE (как было) =====
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendQuery, setFriendQuery] = useState("");

  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // ===== GROUPS (новое) =====
  const [groupRooms, setGroupRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupText, setGroupText] = useState("");

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAvatarUrl, setNewGroupAvatarUrl] = useState(""); // опционально (нужна поддержка на backend)
  const [newGroupMembers, setNewGroupMembers] = useState(""); // usernames через запятую
  const [inviteUsername, setInviteUsername] = useState("");

  // Status
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  // WS
  const stompRef = useRef(null);
  const subRef = useRef(null);

  // If opened as #/chat?chatId=123
  useEffect(() => {
    const hash = window.location.hash || "";
    const q = hash.split("?")[1];
    if (!q) return;

    const sp = new URLSearchParams(q);
    const cid = sp.get("chatId");
    if (cid) {
      const n = Number(cid);
      if (!Number.isNaN(n)) {
        setTab("private");
        setActiveChatId(n);
      }
    }
  }, []);

  const activeChat = useMemo(() => {
    return chats.find((c) => c.chatId === activeChatId) || null;
  }, [chats, activeChatId]);

  const activeRoom = useMemo(() => {
    const id = activeRoomId;
    return groupRooms.find((r) => (r.roomId ?? r.id) === id) || null;
  }, [groupRooms, activeRoomId]);

  // -------------------------
  // PRIVATE REST (как было)
  // -------------------------
  const loadChats = async () => {
    try {
      const res = await api.get("/api/chat/list");
      const list = extractArray(res.data);
      setChats(list);

      if (!activeChatId && list.length > 0 && tab === "private") {
        setActiveChatId(list[0].chatId);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load chats");
    }
  };

  const loadFriends = async () => {
    try {
      const res = await api.get("/api/friends/list");
      setFriends(extractArray(res.data));
    } catch {
      // not critical
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const res = await api.get(`/api/chat/${chatId}/messages`);
      setMessages(extractArray(res.data));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load messages");
    }
  };

  // ✅ Create/open private chat with friend (как было)
  const startChatWithFriend = async (username) => {
    setErr("");
    try {
      const res = await api.post(
        `/api/chat/with/${encodeURIComponent(username)}`,
      );
      const chatId = res.data?.chatId;
      if (!chatId) throw new Error("No chatId returned");

      await loadChats();
      setTab("private");
      setActiveChatId(chatId);
      window.location.hash = `#/chat?chatId=${chatId}`;
    } catch (e) {
      const status = e?.response?.status;
      if (status === 403) {
        setErr(
          "You can chat only with friends (make sure request is accepted).",
        );
      } else {
        setErr(
          e?.response?.data?.error ||
            e?.response?.data?.message ||
            "Failed to start chat",
        );
      }
    }
  };

  const sendPrivate = async () => {
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

    // REST fallback (как было)
    try {
      const res = await api.post("/api/chat/message", {
        chatId: activeChatId,
        content,
      });
      if (res?.data) setMessages((prev) => [...prev, res.data]);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send message");
    }
  };

  // -------------------------
  // GROUP REST (новое)
  // -------------------------
  const loadGroupRooms = async () => {
    try {
      const res = await api.get("/api/group-chat/list");
      const list = extractArray(res.data);
      setGroupRooms(list);

      if (!activeRoomId && list.length > 0 && tab === "groups") {
        const firstId = list[0]?.roomId ?? list[0]?.id;
        if (firstId) setActiveRoomId(firstId);
      }
    } catch (e) {
      // если endpoint ещё не подключён — покажем понятную ошибку
      const msg = e?.response?.data?.message || e?.response?.data?.error;
      if (msg) setErr(msg);
    }
  };

  const loadGroupMessages = async (roomId) => {
    try {
      const res = await api.get(`/api/group-chat/${roomId}/messages`);
      setGroupMessages(extractArray(res.data));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load group messages");
    }
  };

  const createGroup = async () => {
    setErr("");
    const name = newGroupName.trim() || "Group chat";

    try {
      // backend: POST /api/group-chat/create { name, avatarUrl? }
      const res = await api.post("/api/group-chat/create", {
        name,
        avatarUrl: newGroupAvatarUrl.trim() || null, // заработает если добавишь поддержку на backend
      });

      const roomId = res.data?.roomId ?? res.data?.id;
      if (!roomId) throw new Error("No roomId returned");

      // если ввели участников — пригласим их сразу
      const members = newGroupMembers
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      for (const u of members) {
        try {
          await api.post(
            `/api/group-chat/${roomId}/invite/${encodeURIComponent(u)}`,
          );
        } catch {
          // не падаем, просто продолжаем
        }
      }

      setNewGroupName("");
      setNewGroupAvatarUrl("");
      setNewGroupMembers("");

      await loadGroupRooms();
      setTab("groups");
      setActiveRoomId(roomId);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Failed to create group",
      );
    }
  };

  const inviteToGroup = async () => {
    const u = inviteUsername.trim().toLowerCase();
    if (!u || !activeRoomId) return;

    setErr("");
    try {
      await api.post(
        `/api/group-chat/${activeRoomId}/invite/${encodeURIComponent(u)}`,
      );
      setInviteUsername("");
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Failed to invite user",
      );
    }
  };

  const sendGroup = async () => {
    const content = groupText.trim();
    if (!content || !activeRoomId) return;

    setGroupText("");
    setErr("");

    const client = stompRef.current;
    if (client && client.connected) {
      client.publish({
        destination: "/app/group.send",
        headers: { "x-username": me },
        body: JSON.stringify({ roomId: activeRoomId, content }),
      });
      return;
    }

    setErr("WebSocket is not connected");
  };

  // -------------------------
  // WebSocket init (ОДИН клиент на всё)
  // -------------------------
  useEffect(() => {
    setErr("");
    setInfo("Connecting...");

    const wsBase =
      import.meta.env.VITE_WS_URL || `ws://${window.location.host}`;
    const wsUrl = wsBase.endsWith("/ws") ? wsBase : `${wsBase}/ws`;

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 2000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: { "x-username": me },

      onConnect: async () => {
        stompRef.current = client;
        setInfo("Connected");

        // initial loads
        await loadChats();
        await loadFriends();
        await loadGroupRooms();

        // subscribe to current selection
        resubscribe();
      },

      onStompError: (frame) => {
        setInfo(`Error: ${frame?.headers?.message || "stomp error"}`);
      },

      onWebSocketClose: () => setInfo("Disconnected"),
    });

    client.activate();

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

  // Resubscribe helper (private OR groups)
  const resubscribe = () => {
    const client = stompRef.current;
    if (!client || !client.connected) return;

    try {
      subRef.current?.unsubscribe?.();
    } catch {}

    if (tab === "private" && activeChatId) {
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
        },
      );
      return;
    }

    if (tab === "groups" && activeRoomId) {
      subRef.current = client.subscribe(
        `/topic/group.${activeRoomId}`,
        (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            setGroupMessages((prev) => {
              if (prev.some((m) => m.id === payload.id)) return prev;
              return [...prev, payload];
            });
          } catch {}
        },
      );
    }
  };

  // When switching tab: keep design + load data + subscribe correct
  useEffect(() => {
    setErr("");

    if (tab === "private") {
      if (activeChatId) loadMessages(activeChatId);
    } else {
      if (activeRoomId) loadGroupMessages(activeRoomId);
    }

    resubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // When active chat changes
  useEffect(() => {
    if (tab !== "private") return;
    if (!activeChatId) return;
    loadMessages(activeChatId);
    resubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  // When active room changes
  useEffect(() => {
    if (tab !== "groups") return;
    if (!activeRoomId) return;
    loadGroupMessages(activeRoomId);
    resubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoomId]);

  const filteredFriends = useMemo(() => {
    const q = friendQuery.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => (f.username || "").toLowerCase().includes(q));
  }, [friends, friendQuery]);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* HEADER */}
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

        <div className="flex" style={{ gap: 10, alignItems: "center" }}>
          {/* Tabs (в стиле твоего дизайна) */}
          <button
            className={`btn ${tab === "private" ? "" : "secondary"}`}
            onClick={() => setTab("private")}
          >
            Private
          </button>
          <button
            className={`btn ${tab === "groups" ? "" : "secondary"}`}
            onClick={() => setTab("groups")}
          >
            Groups
          </button>

          <button
            className="btn secondary"
            onClick={() => {
              loadChats();
              loadFriends();
              loadGroupRooms();
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR */}
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
          gridTemplateColumns: "380px 1fr",
          minHeight: 560,
        }}
      >
        {/* LEFT SIDEBAR */}
        <div style={{ borderRight: "1px solid rgba(30,41,59,0.8)" }}>
          {tab === "private" ? (
            <>
              {/* Friends (как было) */}
              <div
                style={{
                  padding: 12,
                  borderBottom: "1px solid rgba(30,41,59,0.8)",
                }}
              >
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
                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                      maxHeight: 220,
                      overflow: "auto",
                    }}
                  >
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
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
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
                              {f.firstName?.[0]?.toUpperCase() ||
                                f.lastName?.[0]?.toUpperCase() ||
                                "?"}
                            </div>
                          )}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontWeight: 800,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {f.firstName || ""} {f.lastName || ""}{" "}
                              <span className="text-muted">@{f.username}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn"
                          onClick={() => startChatWithFriend(f.username)}
                          style={{ whiteSpace: "nowrap" }}
                        >
                          Start chat
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chats list (как было) */}
              <div style={{ paddingTop: 8 }}>
                <ChatList
                  chats={chats}
                  activeChatId={activeChatId}
                  onSelect={(id) => setActiveChatId(id)}
                />
              </div>
            </>
          ) : (
            <>
              {/* Groups create panel */}
              <div
                style={{
                  padding: 12,
                  borderBottom: "1px solid rgba(30,41,59,0.8)",
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 8 }}>
                  Create group
                </div>

                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name"
                  style={{ marginBottom: 8 }}
                />

                <input
                  value={newGroupAvatarUrl}
                  onChange={(e) => setNewGroupAvatarUrl(e.target.value)}
                  placeholder="Group avatar URL (optional)"
                  style={{ marginBottom: 8 }}
                />

                <input
                  value={newGroupMembers}
                  onChange={(e) => setNewGroupMembers(e.target.value)}
                  placeholder="Members usernames (comma-separated)"
                  style={{ marginBottom: 10 }}
                />

                <button
                  className="btn"
                  onClick={createGroup}
                  style={{ width: "100%" }}
                >
                  Create
                </button>

                <div
                  className="text-muted"
                  style={{ fontSize: 12, marginTop: 8 }}
                >
                  Tip: you can add members later using invite.
                </div>
              </div>

              {/* Groups list */}
              <div style={{ paddingTop: 8 }}>
                {groupRooms.length === 0 ? (
                  <div
                    className="text-muted"
                    style={{ fontSize: 13, padding: 12 }}
                  >
                    No group chats yet.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 8, padding: 12 }}>
                    {groupRooms.map((r) => {
                      const id = r.roomId ?? r.id;
                      const active = id === activeRoomId;
                      const title = r.name || `Room #${id}`;
                      const avatar = r.avatarUrl || r.avatar || null;

                      return (
                        <div
                          key={id}
                          className="panel"
                          onClick={() => setActiveRoomId(id)}
                          style={{
                            padding: 10,
                            cursor: "pointer",
                            outline: active
                              ? "2px solid rgba(56,189,248,0.35)"
                              : "none",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            {avatar ? (
                              <img
                                src={avatar}
                                alt={title}
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 10,
                                  objectFit: "cover",
                                  flexShrink: 0,
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 10,
                                  background: "rgba(30,41,59,0.8)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 900,
                                  color: "rgba(255,255,255,0.55)",
                                  flexShrink: 0,
                                }}
                              >
                                #
                              </div>
                            )}

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 900,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {title}
                              </div>
                              <div
                                className="text-muted"
                                style={{ fontSize: 12 }}
                              >
                                Members: {r.memberCount ?? 0}
                              </div>

                              {r.lastMessage ? (
                                <div
                                  className="text-muted"
                                  style={{ fontSize: 12 }}
                                >
                                  {r.lastMessage}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div style={{ display: "grid", gridTemplateRows: "1fr auto" }}>
          <div style={{ padding: 14, overflow: "auto" }}>
            {tab === "private" ? (
              <>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>
                    {activeChat
                      ? activeChat.title || `Chat #${activeChat.chatId}`
                      : "Select a chat or start one with a friend"}
                  </div>
                  {activeChat?.withUsername && (
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      with @{activeChat.withUsername}
                    </div>
                  )}
                </div>

                <MessageList messages={messages} me={me} />
              </>
            ) : (
              <>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>
                    {activeRoom
                      ? activeRoom.name || `Group #${activeRoomId}`
                      : "Select a group chat"}
                  </div>

                  {activeRoom && (
                    <div
                      className="text-muted"
                      style={{ fontSize: 12, marginTop: 2 }}
                    >
                      Members: {activeRoom.memberCount ?? 0}
                    </div>
                  )}

                  {/* Invite UI справа сверху, как в твоём стиле */}
                  {activeRoomId && (
                    <div className="flex" style={{ gap: 10, marginTop: 10 }}>
                      <input
                        value={inviteUsername}
                        onChange={(e) => setInviteUsername(e.target.value)}
                        placeholder="Invite username..."
                      />
                      <button className="btn secondary" onClick={inviteToGroup}>
                        Invite
                      </button>
                    </div>
                  )}
                </div>

                {/* Group messages render (простая лента, чтобы не ломать твой MessageList) */}
                <div style={{ display: "grid", gap: 10 }}>
                  {groupMessages.map((m) => {
                    const sender = m.senderUsername || m.sender || "unknown";
                    const mine = sender === me;

                    return (
                      <div
                        key={m.id || `${m.createdAt}-${m.content}`}
                        style={{
                          display: "flex",
                          justifyContent: mine ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          className="panel"
                          style={{
                            padding: 10,
                            maxWidth: 520,
                            border: mine
                              ? "1px solid rgba(56,189,248,0.25)"
                              : undefined,
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 12,
                              opacity: 0.85,
                            }}
                          >
                            @{sender}
                          </div>
                          <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                            {m.content}
                          </div>
                          {m.createdAt && (
                            <div
                              className="text-muted"
                              style={{ fontSize: 11, marginTop: 6 }}
                            >
                              {new Date(m.createdAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Composer */}
          <div
            style={{
              padding: 14,
              borderTop: "1px solid rgba(30,41,59,0.8)",
              background: "rgba(2,6,23,0.35)",
            }}
          >
            {tab === "private" ? (
              <>
                <div className="flex" style={{ gap: 10 }}>
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      activeChatId ? "Type a message..." : "Select a chat first"
                    }
                    disabled={!activeChatId}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendPrivate();
                    }}
                  />
                  <button
                    className="btn"
                    onClick={sendPrivate}
                    disabled={!activeChatId}
                  >
                    Send
                  </button>
                </div>

                <div
                  className="text-muted"
                  style={{ fontSize: 12, marginTop: 8 }}
                >
                  Tip: If you just became friends, use “Start chat” in Friends
                  to create the chat.
                </div>
              </>
            ) : (
              <>
                <div className="flex" style={{ gap: 10 }}>
                  <input
                    value={groupText}
                    onChange={(e) => setGroupText(e.target.value)}
                    placeholder={
                      activeRoomId
                        ? "Type a group message..."
                        : "Select a group first"
                    }
                    disabled={!activeRoomId}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendGroup();
                    }}
                  />
                  <button
                    className="btn"
                    onClick={sendGroup}
                    disabled={!activeRoomId}
                  >
                    Send
                  </button>
                </div>

                <div
                  className="text-muted"
                  style={{ fontSize: 12, marginTop: 8 }}
                >
                  Tip: Use Invite to add members into the group.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
