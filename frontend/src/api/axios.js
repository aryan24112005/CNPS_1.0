import axios from "axios";

// Centralized API base URL configuration
// In production: set VITE_API_URL in Netlify to https://cnps-ouwq.onrender.com/api
// In local dev: set VITE_API_URL in .env to http://localhost:5000/api
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 
  "https://cnps-ouwq.onrender.com/api"
).replace(/\/+$/, ""); // Remove trailing slashes

const api = axios.create({ baseURL: API_BASE_URL });

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
