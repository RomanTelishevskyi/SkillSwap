import React, { useEffect, useRef } from "react";

export default function MessageList({ me, messages }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="text-muted center" style={{ height: "100%" }}>
        No messages yet. Say hi 👋
      </div>
    );
  }

  return (
    <div>
      {messages.map((m) => {
        const mine = m.sender === me;
        return (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: mine ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: 8,
              marginBottom: 8,
            }}
          >
            {!mine && (
              <>
                {m.senderProfilePicture ? (
                  <img
                    src={m.senderProfilePicture}
                    alt={m.sender}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(30,41,59,0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.5)",
                      flexShrink: 0,
                    }}
                  >
                    {m.sender?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </>
            )}
            <div
              style={{
                maxWidth: "70%",
                padding: "10px 14px",
                borderRadius: 16,
                background: mine
                  ? "linear-gradient(135deg, rgba(20,184,166,0.9), rgba(56,189,248,0.9))"
                  : "rgba(255,255,255,0.08)",
                color: mine ? "#021a18" : "var(--text)",
                boxShadow: mine
                  ? "0 8px 20px rgba(20,184,166,0.35)"
                  : "0 4px 14px rgba(0,0,0,0.25)",
              }}
            >
              {!mine && (
                <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>
                  @{m.sender}
                </div>
              )}
              <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
              <div
                style={{
                  fontSize: 10,
                  opacity: 0.6,
                  marginTop: 6,
                  textAlign: mine ? "right" : "left",
                }}
              >
                {new Date(m.createdAt).toLocaleTimeString()}
              </div>
            </div>
            {mine && (
              <>
                {m.senderProfilePicture ? (
                  <img
                    src={m.senderProfilePicture}
                    alt={m.sender}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(30,41,59,0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.5)",
                      flexShrink: 0,
                    }}
                  >
                    {m.sender?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
