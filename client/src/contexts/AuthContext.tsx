import axios from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";

interface User {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  hasRole: (roles: string[]) => boolean;
  userRole: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Configure axios defaults
const API_URL = "http://localhost:8000";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  useEffect(() => {
    // Initialize user from localStorage if available
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Set axios authorization header if token exists
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      // Get CSRF cookie first
      await axios.get("/sanctum/csrf-cookie");

      const response = await axios.post("/api/login", {
        email,
        password,
      });

      const { token, user } = response.data;
      setToken(token);
      setUser(user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await axios.post(
          "/api/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      setToken(null);
      setUser(null);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      delete axios.defaults.headers.common["Authorization"];
    } catch (error: any) {
      console.error("Logout error:", error.response?.data || error.message);
      // Still clear the local state even if the server request fails
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user || !user.role) return false;
    return roles.includes(user.role.name.toLowerCase());
  };

  const userRole = user?.role?.name || "";
  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoggedIn, hasRole, userRole }}
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
