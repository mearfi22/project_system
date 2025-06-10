import React, { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";
import { ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: {
    name: string;
    permissions: string[];
  };
  isCashier: () => boolean;
  isManager: () => boolean;
  isAdmin: () => boolean;
  hasPermission: (permission: string) => boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get("/api/user");
      const userData = response.data;

      // Make sure we have the role and permissions data
      if (!userData.role || !userData.role.permissions) {
        console.error("Missing role or permissions data:", userData);
        setUser(null);
        return;
      }

      setUser({
        ...userData,
        isCashier: () => userData.role.name === "cashier",
        isManager: () => userData.role.name === "manager",
        isAdmin: () => userData.role.name === "admin",
        hasPermission: (permission: string) => {
          // Log the permission check for debugging
          console.log("Checking permission:", permission);
          console.log("User permissions:", userData.role.permissions);
          return userData.role.permissions.includes(permission);
        },
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Get CSRF cookie
      await axios.get("/sanctum/csrf-cookie");
      // Attempt login
      await axios.post("/api/login", { email, password });
      // Check auth status after login
      await checkAuth();
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Invalid credentials");
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
