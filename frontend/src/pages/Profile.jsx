import React, { useEffect, useState } from "react";
import api from "../api/client";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  const [skill, setSkill] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState(3);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setErr("");
    setMsg("");
    try {
      const p = await api.get("/api/profile/me");
      setProfile(p.data);
      setFirstName(p.data.firstName);
      setLastName(p.data.lastName);
      setProfilePicture(p.data.profilePicture || "");

      const s = await api.get("/api/skills/me");
      setSkills(s.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load profile");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async () => {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await api.put("/api/profile/me", { 
        firstName, 
        lastName,
        profilePicture: profilePicture || "" // Send empty string to remove, or the base64 value
      });
      setProfile(res.data);
      setProfilePicture(res.data.profilePicture || "");
      setMsg("Profile updated");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async () => {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      await api.post("/api/skills/me", {
        skill,
        category,
        level: Number(level),
      });
      setSkill("");
      setCategory("");
      setLevel(3);
      setMsg("Skill saved");
      const s = await api.get("/api/skills/me");
      setSkills(s.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to add skill");
    } finally {
      setLoading(false);
    }
  };

  const removeSkill = async (skillName) => {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      await api.delete(`/api/skills/me/${encodeURIComponent(skillName)}`);
      setMsg("Skill deleted");
      const s = await api.get("/api/skills/me");
      setSkills(s.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete skill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex-between">
        <div>
          <h2 style={{ margin: 0 }}>Profile</h2>
          <div className="text-muted" style={{ marginTop: 4 }}>
            Manage your personal info and skills
          </div>
        </div>
        <div className="text-muted" style={{ fontSize: 13 }}>
          @{profile?.username || localStorage.getItem("username")}
        </div>
      </div>

      {err && (
        <div
          className="mt-4"
          style={{
            border: "1px solid rgba(239,68,68,0.35)",
            background: "rgba(239,68,68,0.08)",
            padding: "10px 12px",
            borderRadius: 12,
          }}
        >
          {err}
        </div>
      )}

      {msg && (
        <div
          className="mt-4"
          style={{
            border: "1px solid rgba(34,197,94,0.35)",
            background: "rgba(34,197,94,0.08)",
            padding: "10px 12px",
            borderRadius: 12,
          }}
        >
          {msg}
        </div>
      )}

      <div className="mt-6">
        <h3 style={{ margin: 0 }}>Personal info</h3>

        <div className="mt-4" style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div>
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(20,184,166,0.35)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "rgba(30,41,59,0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(20,184,166,0.35)",
                  fontSize: 40,
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                {firstName?.[0]?.toUpperCase() || lastName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <label>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64String = reader.result;
                    setProfilePicture(base64String);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              style={{ marginBottom: 10 }}
            />
            {profilePicture && (
              <button
                className="btn secondary"
                onClick={() => setProfilePicture("")}
                style={{
                  borderColor: "rgba(239,68,68,0.25)",
                  color: "#fca5a5",
                  fontSize: 13,
                }}
              >
                Remove picture
              </button>
            )}
          </div>
        </div>

        <div className="flex mt-4">
          <div style={{ flex: 1 }}>
            <label>First name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Last name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <button className="btn" onClick={saveProfile} disabled={loading}>
            {loading ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>

      <hr className="mt-6" style={{ borderColor: "rgba(30,41,59,0.8)" }} />

      <div className="mt-6">
        <h3 style={{ margin: 0 }}>My skills</h3>
        <div className="text-muted mt-2">
          Add skills you can teach. Level 1–5.
        </div>

        <div className="flex mt-4">
          <div style={{ flex: 2 }}>
            <label>Skill</label>
            <input
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="English, Piano, Java..."
            />
          </div>

          <div style={{ flex: 2 }}>
            <label>Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Languages, Music, Programming..."
            />
          </div>

          <div style={{ flex: 1 }}>
            <label>Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            className="btn"
            onClick={addSkill}
            disabled={loading || !skill || !category}
          >
            {loading ? "Saving..." : "Add / Update skill"}
          </button>
        </div>

        <div className="mt-6">
          {skills.length === 0 ? (
            <div className="text-muted">
              No skills yet. Add your first one above.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {skills.map((s, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{ padding: 14, borderRadius: 14 }}
                >
                  <div className="flex-between">
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.skill}</div>
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        {s.category} · level {s.level}
                      </div>
                    </div>

                    <button
                      className="btn secondary"
                      onClick={() => removeSkill(s.skill)}
                      disabled={loading}
                      style={{
                        borderColor: "rgba(239,68,68,0.25)",
                        color: "#fca5a5",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
