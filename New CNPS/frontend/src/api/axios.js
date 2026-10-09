import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

// Attach JWT to every admin request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cnps_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — log out if token expired
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isAdminRoute = window.location.pathname.startsWith("/admin");
      if (isAdminRoute) {
        localStorage.removeItem("cnps_token");
        localStorage.removeItem("cnps_admin");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
