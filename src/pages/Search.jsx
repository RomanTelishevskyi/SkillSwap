// src/pages/Search.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import UserCard from "../components/UserCard";

export default function Search() {
  const { user, users } = useAuth();

  // Защищаемся от undefined и пустых массивов
  const safeKnows = (u) => (Array.isArray(u.knows) ? u.knows : []);
  const safeWants = (u) => (Array.isArray(u.wants) ? u.wants : []);

  // Идеальные совпадения
  const matches = users.filter(
    (u) =>
      u.email !== user.email &&
      safeKnows(u).some((k) => safeWants(user).includes(k)) &&
      safeWants(u).some((w) => safeKnows(user).includes(w))
  );

  // Остальные пользователи, которые интересны текущему пользователю
  const others = users.filter(
    (u) =>
      u.email !== user.email &&
      !matches.includes(u) &&
      safeKnows(u).some((k) => safeWants(user).includes(k))
  );

  return (
    <div className="form-container">
      <h2>Search</h2>

      {matches.length > 0 && (
        <>
          <h3>Perfect Matches</h3>
          {matches.map((u) => (
            <UserCard key={u.email} user={u} />
          ))}
        </>
      )}

      {others.length > 0 && (
        <>
          <h3>Other Users</h3>
          {others.map((u) => (
            <UserCard key={u.email} user={u} />
          ))}
        </>
      )}

      {matches.length === 0 && others.length === 0 && (
        <p>No users found yet. Invite friends or update your profile!</p>
      )}
    </div>
  );
}
