import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { mockApi } from "../mockApi";

export default function Chat() {
  const { id } = useParams(); // email пользователя
  const { user, users } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const other = users.find((u) => u.email === id);
  const chatId = [user.email, id].sort().join("-");

  useEffect(() => {
    setMessages(mockApi.getMessages(chatId));
  }, []);

  const sendMessage = () => {
    if (!text) return;
    const msg = { from: user.email, text, date: new Date().toISOString() };
    mockApi.addMessage(chatId, msg);
    setMessages([...messages, msg]);
    setText("");
  };

  return (
    <div className="form-container">
      <h2>Chat with {other?.name}</h2>
      <div className="chat-box">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.from === user.email ? "chat-msg me" : "chat-msg"}
          >
            <p>{m.text}</p>
            <span>{new Date(m.date).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
