'use client';

import { useEffect, useRef, createContext, useContext } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getWsUrl } from '@/lib/api';

const RealtimeContext = createContext({});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const socketRef = useRef<WebSocket | null>(null);
  const pathname = usePathname();
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const attempts = useRef(0);
  const pathnameRef = useRef(pathname);

  // Pathname o'zgarishini kuzatamiz, lekin WebSocket'ni qayta ishga tushirmaslik uchun ref da saqlaymiz
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!token) return;

    const connect = () => {
      // Agar ulanish allaqachon mavjud bo'lsa yoki ulanayotgan bo'lsa, hech narsa qilmaymiz
      const state = socketRef.current?.readyState;
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) return;

      const wsBase = getWsUrl();
      const url = `${wsBase}notifications/?token=${token}`;

      let socket: WebSocket;
      try {
        socket = new WebSocket(url);
      } catch (e) {
        console.error('WebSocket yaratishda xatolik:', e);
        scheduleReconnect();
        return;
      }
      
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('Notification Socket connected.');
        attempts.current = 0; // muvaffaqiyatli ulanganda sanagichni nolga tushiramiz

        // Ping intervalini tozalab, yangidan qo'shamiz
        if (pingTimerRef.current) clearInterval(pingTimerRef.current);
        pingTimerRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'pong') return; // ping uchun javob

          if (data.type === 'new_message') {
            if (!pathnameRef.current.includes('/chat')) {
              toast.success('Yangi xabar! ✉️');
            }
            window.dispatchEvent(new CustomEvent('refresh-unread-counts'));
          }
          if (data.type === 'order_update') {
            toast.success(data.created ? 'Yangi buyurtma! 📦' : 'Buyurtma yangilandi! ✅');
            if (pathnameRef.current.includes('/orders') || pathnameRef.current.includes('/dashboard')) {
              window.dispatchEvent(new CustomEvent('refresh-orders'));
            }
          }
        } catch (err) {
          // JSON xatosi
        }
      };

      socket.onclose = (event) => {
        if (pingTimerRef.current) clearInterval(pingTimerRef.current);
        
        // Agar auth muammosi sabab uzilsa (kod 4001, 4003), qattiq loopga tushmaslik uchun kutamiz yoki to'xtatamiz
        if (event.code === 4001 || event.code === 4003) {
          console.warn(`WebSocket auth xatosi (${event.code}). Qayta ulanilmaydi.`);
          return;
        }

        console.log('Notification Socket closed. Reconnecting...');
        scheduleReconnect();
      };
      
      socket.onerror = () => {
        // xato chiqsa onclose ishga tushadi
      };
    };

    const scheduleReconnect = () => {
      attempts.current++;
      const delay = Math.min(1000 * Math.pow(2, attempts.current - 1), 30000); // 1s, 2s, 4s... max 30s
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    connect();

    return () => {
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) {
        socketRef.current.onclose = null; // cleanup paytida loop bo'lib qolmasligi uchun
        socketRef.current.close();
      }
    };
  }, [token]); // pathname olib tashlandi, har sahifa ochilganda uzilib ulanmaydi

  return (
    <RealtimeContext.Provider value={{}}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);
