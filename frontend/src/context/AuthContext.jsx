import { createContext, useContext, useEffect, useState } from "react";

import api, { clearToken, getToken, setToken } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user);
  const role = user?.role || null;

  const loadCurrentUser = async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");

      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to restore authentication:", error);

      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    const { token, user } = response.data;

    setToken(token);
    setUser(user);

    return user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const value = {
    user,
    role,
    isAuthenticated,
    loading,
    login,
    logout,
    loadCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
