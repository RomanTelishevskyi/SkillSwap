// src/pages/Matches.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import UserCard from "../components/UserCard";

export default function Matches() {
  const { user, users } = useAuth();

  // Функции для безопасного доступа к массивам
  const safeKnows = (u) => (Array.isArray(u.knows) ? u.knows : []);
  const safeWants = (u) => (Array.isArray(u.wants) ? u.wants : []);

  // Выбираем всех пользователей, кроме текущего
  const others = users.filter((u) => u.email !== user.email);

  // Можно дополнительно сортировать по совпадению навыков
  const sortedOthers = others.sort((a, b) => {
    const aMatchCount = safeKnows(a).filter((k) =>
      safeWants(user).includes(k)
    ).length;
    const bMatchCount = safeKnows(b).filter((k) =>
      safeWants(user).includes(k)
    ).length;
    return bMatchCount - aMatchCount; // сначала больше совпадений
  });

  return (
    <div className="form-container">
      <h2>Matches</h2>

      {sortedOthers.length > 0 ? (
        sortedOthers.map((u) => <UserCard key={u.email} user={u} />)
      ) : (
        <p>No matches found yet. Update your profile or invite friends!</p>
      )}
    </div>
  );
}
