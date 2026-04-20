import { create } from 'zustand';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null;
  role: string | null;
  username: string | null;
  setAuth: (token: string, role: string, username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: Cookies.get('token') || null,
  role: Cookies.get('role') || null,
  username: Cookies.get('username') || null,
  setAuth: (token, role, username) => {
    Cookies.set('token', token);
    Cookies.set('role', role);
    Cookies.set('username', username);
    set({ token, role, username });
  },
  logout: () => {
    Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('username');
    set({ token: null, role: null, username: null });
  },
}));
