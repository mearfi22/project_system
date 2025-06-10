import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import AxiosInstance from "../utils/AxiosInstance";

interface User {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  role: {
    name: string;
    permissions: string[];
  };
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  login: (
    email: string,
    password: string,
    recaptchaToken: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  hasRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  userRole: string;
  setLastPath: (path: string) => void;
  lastPath: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [lastPath, setLastPath] = useState<string>("/");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          // Set token in axios headers
          AxiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;

          // Debug logging
          console.log("Initializing auth with token:", storedToken);
          console.log(
            "Authorization header:",
            AxiosInstance.defaults.headers.common["Authorization"]
          );

          const response = await AxiosInstance.get("/api/user");
          console.log("User data loaded:", response.data);
          setUser(response.data);
          setToken(storedToken);
        } catch (error) {
          console.error("Auth check failed:", error);
          // Clear invalid token
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const login = async (
    email: string,
    password: string,
    recaptchaToken: string
  ) => {
    try {
      const response = await AxiosInstance.post("/api/login", {
        email,
        password,
        recaptcha_token: recaptchaToken,
      });

      const { token: newToken, user: userData } = response.data;

      // Debug logging
      console.log("Login successful - Token:", newToken);
      console.log("User data:", userData);

      // Save token to localStorage
      localStorage.setItem("token", newToken);

      // Set token in axios headers
      AxiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${newToken}`;

      // Debug logging
      console.log(
        "Authorization header set:",
        AxiosInstance.defaults.headers.common["Authorization"]
      );

      setToken(newToken);
      setUser(userData);

      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AxiosInstance.post("/api/logout");
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with cleanup even if the API call fails
    } finally {
      // Clear token from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Remove token from axios headers
      delete AxiosInstance.defaults.headers.common["Authorization"];
      setToken(null);
      setUser(null);
      // Redirect to login page
      window.location.href = "/login";
    }
  };

  const hasRole = (roles: string[]): boolean => {
    return Boolean(user?.role && roles.includes(user.role.name));
  };

  const hasPermission = (permission: string): boolean => {
    return Boolean(user?.role?.permissions?.includes(permission));
  };

  const userRole = user?.role?.name || "";

  const isLoggedIn = Boolean(user && token);

  if (!isInitialized) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoggedIn,
        hasRole,
        hasPermission,
        userRole,
        setLastPath,
        lastPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
