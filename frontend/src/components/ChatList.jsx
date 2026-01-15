import React from "react";

export default function ChatList({ chats, activeChatId, onSelect }) {
  if (!chats || chats.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ fontWeight: 800 }}>No chats</div>
        <div className="text-muted mt-2" style={{ fontSize: 13 }}>
          Add friends and open a chat.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 10 }}>
      {chats.map((c) => {
        const active = c.chatId === activeChatId;
        return (
          <div
            key={c.chatId}
            onClick={() => onSelect?.(c.chatId)}
            style={{
              padding: 12,
              borderRadius: 14,
              cursor: "pointer",
              border: active
                ? "1px solid rgba(20,184,166,0.35)"
                : "1px solid rgba(30,41,59,0.8)",
              background: active
                ? "rgba(20,184,166,0.10)"
                : "rgba(255,255,255,0.02)",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {c.withProfilePicture ? (
                <img
                  src={c.withProfilePicture}
                  alt={c.withFirstName}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(30,41,59,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.5)",
                    flexShrink: 0,
                  }}
                >
                  {c.withFirstName?.[0]?.toUpperCase() || c.withLastName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800 }}>
                  {c.withFirstName} {c.withLastName}
                  <span
                    className="text-muted"
                    style={{ fontWeight: 500, marginLeft: 6 }}
                  >
                    @{c.withUsername}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="text-muted"
              style={{
                marginTop: 6,
                fontSize: 13,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 320,
              }}
            >
              {c.lastMessage ? c.lastMessage : "No messages yet"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
