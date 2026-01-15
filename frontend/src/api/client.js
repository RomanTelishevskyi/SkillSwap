import axios from "axios";

const api = axios.create({
  baseURL: "", // используем Vite proxy: /api -> backend
  timeout: 15000,
});

// добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// если токен протух/невалиден — чистим и отправляем на login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      if (window.location.hash !== "#/login") {
        window.location.hash = "#/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
