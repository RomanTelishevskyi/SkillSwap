import React, { createContext, useState, useContext } from "react";
import { mockApi } from "../mockApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [users, setUsers] = useState(mockApi.getUsers());

  const login = (email, password) => {
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      localStorage.setItem("user", JSON.stringify(found));
      setUser(found);
      return true;
    }
    return false;
  };

  const register = (data) => {
    const exists = users.find((u) => u.email === data.email);
    if (exists) return false;
    mockApi.addUser(data);
    setUsers(mockApi.getUsers());
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return true;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, users, login, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
