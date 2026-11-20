import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "../api/client";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone_number?: string;
  preferences?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; password: string; full_name: string; phone_number?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const urlToken = new URLSearchParams(window.location.search).get("token");
      if (urlToken) {
        localStorage.setItem("vb_token", urlToken);
        return urlToken;
      }
    }
    return localStorage.getItem("vb_token");
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const currentToken = token || localStorage.getItem("vb_token");
      if (currentToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch (err) {
          console.error("Token verification failed:", err);
          localStorage.removeItem("vb_token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await authApi.login(credentials);
    localStorage.setItem("vb_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (payload: { email: string; password: string; full_name: string; phone_number?: string }) => {
    const res = await authApi.register(payload);
    localStorage.setItem("vb_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("vb_token");
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === "Administrator";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
