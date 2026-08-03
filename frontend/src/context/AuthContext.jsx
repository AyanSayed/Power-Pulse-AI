import { createContext, useContext, useState } from "react";
import { loginRequest, getMeRequest, verifyEmailOtpRequest } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("pp_token"));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("pp_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("pp_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Verifies email+password against the backend and stores the session.
  const login = async (email, password) => {
    const data = await loginRequest({ email, password }); // throws on 401/403
    localStorage.setItem("pp_token", data.token);
    localStorage.setItem("pp_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  const completeVerification = async (email, code) => {
    const data = await verifyEmailOtpRequest({ email, code });
    localStorage.setItem("pp_token", data.token);
    localStorage.setItem("pp_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  // Restores the session by asking the backend who this token belongs to.
  const refreshUser = async () => {
    const savedToken = localStorage.getItem("pp_token");
    if (!savedToken) return null;
    const data = await getMeRequest(savedToken);
    localStorage.setItem("pp_user", JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("pp_token");
    localStorage.removeItem("pp_user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, completeVerification, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
