import axios from 'axios';
import Cookies from 'js-cookie';

// Dev: localhost:3000 -> 127.0.0.1:8000
// Prod: Nginx proksi qiladi
const getBaseURL = () => {
  if (typeof window === 'undefined') return '/api/';
  if (window.location.port === '3000') return 'http://127.0.0.1:8000/api/';
  return '/api/';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Trailing slash (/) qo'shish (Django CORS xatolari uchun muhim)
  if (config.url && !config.url.endsWith('/') && !config.url.includes('?')) {
    config.url += '/';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      // Token yaroqsiz bo'lsa, avtomatik login sahifasiga otamiz
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// WebSocket uchun yordamchi funksiya
export const getWsUrl = (): string => {
  // Agar localhost:3000 bo'lsa (dev rejimida ishlayotgan bo'lsangiz)
  // HAR QANDAY HOLATDA 8000 portga ulansin!
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return 'ws://127.0.0.1:8000/ws/';
  }

  // Prod yoki env bo'lsa
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  
  if (typeof window === 'undefined') return 'ws://127.0.0.1:8000/ws/';
  
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ws/`;
};
