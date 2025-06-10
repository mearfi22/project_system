import axios from "axios";

// Function to get CSRF token
const getCsrfToken = async () => {
  try {
    await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
      withCredentials: true,
    });
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
  }
};

const AxiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

AxiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");

    // Get CSRF token before making non-GET requests
    if (config.method !== "get") {
      await getCsrfToken();
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

AxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;
