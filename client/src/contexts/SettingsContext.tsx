import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AxiosInstance from "../utils/AxiosInstance";
import { useAuth } from "./AuthContext";

interface Setting {
  id: number;
  key: string;
  value: string;
  type: string;
  group: string;
  label: string;
  description: string | null;
}

interface SettingsContextType {
  settings: Setting[];
  updateSettings: (key: string, value: any) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn, hasPermission } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      fetchSettings();
    } else {
      setSettings([]);
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const fetchSettings = async () => {
    try {
      // First try to get public settings
      const publicResponse = await AxiosInstance.get("/api/settings/public");
      const publicSettings = Object.entries(publicResponse.data.settings).map(
        ([key, value]) => ({
          id: 0, // Public settings don't need IDs as they can't be modified
          key,
          value: String(value), // Convert value to string to match Setting interface
          type:
            typeof value === "boolean"
              ? "boolean"
              : typeof value === "number"
              ? "number"
              : "string",
          group: "store", // Most public settings are store settings
          label: key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          description: null,
        })
      ) as Setting[];

      // If user has manage_settings permission, also get all settings
      if (hasPermission("manage_settings")) {
        const response = await AxiosInstance.get("/api/settings");
        const allSettings = Object.values(
          response.data.settings
        ).flat() as Setting[];
        setSettings(allSettings);
      } else {
        setSettings(publicSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // If there's an error, still try to show public settings
      try {
        const publicResponse = await AxiosInstance.get("/api/settings/public");
        const publicSettings = Object.entries(publicResponse.data.settings).map(
          ([key, value]) => ({
            id: 0,
            key,
            value: String(value), // Convert value to string to match Setting interface
            type:
              typeof value === "boolean"
                ? "boolean"
                : typeof value === "number"
                ? "number"
                : "string",
            group: "store",
            label: key
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
            description: null,
          })
        ) as Setting[];
        setSettings(publicSettings);
      } catch (publicError) {
        console.error("Error fetching public settings:", publicError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (key: string, value: any) => {
    try {
      if (!hasPermission("manage_settings")) {
        throw new Error("You don't have permission to update settings");
      }
      const setting = settings.find((s) => s.key === key);
      if (!setting) {
        throw new Error("Setting not found");
      }
      await AxiosInstance.put(`/api/settings/${setting.id}`, { value });
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value: String(value) } : s))
      );
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
