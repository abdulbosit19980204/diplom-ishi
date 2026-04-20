import { create } from 'zustand';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null;
  role: string | null;
  username: string | null;
  userId: string | null;
  isSuperuser: boolean;
  setAuth: (token: string, role: string, username: string, userId: string, isSuperuser: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: Cookies.get('token') || null,
  role: Cookies.get('role') || null,
  username: Cookies.get('username') || null,
  userId: Cookies.get('userId') || null,
  isSuperuser: Cookies.get('isSuperuser') === 'true',
  setAuth: (token, role, username, userId, isSuperuser) => {
    Cookies.set('token', token);
    Cookies.set('role', role);
    Cookies.set('username', username);
    Cookies.set('userId', userId);
    Cookies.set('isSuperuser', String(isSuperuser));
    set({ token, role, username, userId, isSuperuser });
  },
  logout: () => {
    Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('username');
    Cookies.remove('userId');
    Cookies.remove('isSuperuser');
    set({ token: null, role: null, username: null, userId: null, isSuperuser: false });
  },
}));
