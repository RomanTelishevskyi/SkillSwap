import React from "react";
import Navbar from "./Navbar";

export default function Layout({ authed, onLogout, children }) {
  return (
    <div className="app-root">
      <Navbar authed={authed} onLogout={onLogout} />
      <main className="app-main">{children}</main>
    </div>
  );
}
