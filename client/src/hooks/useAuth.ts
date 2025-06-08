import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";

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

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get("/api/user");
      const userData = response.data;

      setUser({
        ...userData,
        isCashier: () => userData.role.name === "cashier",
        isManager: () => userData.role.name === "manager",
        isAdmin: () => userData.role.name === "admin",
        hasPermission: (permission: string) =>
          userData.role.permissions.includes(permission),
      });
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await axios.post("/api/login", { email, password });
      await checkAuth();
    } catch (error) {
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
