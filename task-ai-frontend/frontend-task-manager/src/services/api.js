import axios from "axios";

// Auto detect API URL
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ADD TOKEN TO EVERY REQUEST
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// GLOBAL ERROR HANDLER
let logoutInProgress = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    // Xử lý 401 (Unauthorized) và 403 (Forbidden)
    if ((status === 401 || status === 403) && !logoutInProgress) {
      // Tránh gọi logout nhiều lần
      logoutInProgress = true;

      // Chỉ logout nếu không phải ở trang login/register
      if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("lang");

        // Redirect tới /login
        window.location.href = "/login";
      }

      logoutInProgress = false;
    }

    return Promise.reject(error);
  }
);

export default api;
