import React, { useEffect, useMemo, useState } from "react";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";

function getRoute() {
  const hash = window.location.hash || "#/login";
  return hash.replace("#", "");
}

function isAuthed() {
  return !!localStorage.getItem("token");
}

export default function App() {
  const [route, setRoute] = useState(getRoute());
  const [authed, setAuthed] = useState(isAuthed());

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const onStorage = () => setAuthed(isAuthed());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const page = useMemo(() => {
    // public
    if (!authed) {
      if (route === "/register")
        return <Register onAuth={() => setAuthed(true)} />;
      return <Login onAuth={() => setAuthed(true)} />;
    }

    // private
    if (route === "/search") return <Search />;
    if (route === "/profile") return <Profile />;
    if (route.startsWith("/chat")) return <Chat />;

    // default private route
    window.location.hash = "#/search";
    return null;
  }, [route, authed]);

  return (
    <Layout authed={authed} onLogout={() => setAuthed(false)}>
      {page}
    </Layout>
  );
}
