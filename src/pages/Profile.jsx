import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user, setUser, users } = useAuth();
  const [knows, setKnows] = useState(user.knows || []);
  const [wants, setWants] = useState(user.wants || []);

  const allSkills = [
    "English",
    "German",
    "Tennis",
    "Chess",
    "Coding",
    "Cooking",
  ];

  const saveProfile = () => {
    const updated = { ...user, knows, wants };
    const updatedUsers = users.map((u) =>
      u.email === user.email ? updated : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    alert("Profile saved!");
  };

  return (
    <div className="form-container">
      <h2>Profile</h2>
      <div className="form-card">
        <label>Knows:</label>
        <select
          multiple
          value={knows}
          onChange={(e) =>
            setKnows([...e.target.selectedOptions].map((o) => o.value))
          }
        >
          {allSkills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <label>Wants to learn:</label>
        <select
          multiple
          value={wants}
          onChange={(e) =>
            setWants([...e.target.selectedOptions].map((o) => o.value))
          }
        >
          {allSkills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button onClick={saveProfile} className="btn">
          Save
        </button>
      </div>
    </div>
  );
}
