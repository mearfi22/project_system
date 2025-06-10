import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the token to every request
AxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 500) {
      // Only redirect to login if we're not already on the login page
      if (!window.location.pathname.includes("/login")) {
        // Clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect to login
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;
