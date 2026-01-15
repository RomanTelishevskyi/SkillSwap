import React from "react";

export default function Navbar({ authed, onLogout }) {
  const go = (path) => {
    window.location.hash = path;
  };

  return (
    <header className="navbar">
      <div className="navbar-left" onClick={() => go("#/search")}>
        <span className="logo">Skill</span>
        <span className="logo-accent">Swap</span>
      </div>

      <nav className="navbar-right">
        {authed ? (
          <>
            <button onClick={() => go("#/search")}>Search</button>
            <button onClick={() => go("#/profile")}>Profile</button>
            <button onClick={() => go("#/chat")}>Chats</button>
            <button
              className="btn-logout"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                onLogout();
                go("#/login");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => go("#/login")}>Login</button>
            <button onClick={() => go("#/register")}>Register</button>
          </>
        )}
      </nav>
    </header>
  );
}
