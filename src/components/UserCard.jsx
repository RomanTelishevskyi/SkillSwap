// src/components/UserCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function UserCard({ user }) {
  const knows = Array.isArray(user.knows) ? user.knows : [];
  const wants = Array.isArray(user.wants) ? user.wants : [];

  return (
    <div className="card">
      <h3>{user.name}</h3>
      <p>
        <strong>Knows:</strong> {knows.join(", ") || "Nothing yet"}
      </p>
      <p>
        <strong>Wants to learn:</strong> {wants.join(", ") || "Nothing yet"}
      </p>
      <Link to={`/chat/${user.email}`}>Chat</Link>
    </div>
  );
}
