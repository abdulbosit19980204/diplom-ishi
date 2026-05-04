'use client';
import { useEffect, useRef, createContext, useContext } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore'; // If needed
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';

const RealtimeContext = createContext({});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { token, userId, role } = useAuthStore();
  const socketRef = useRef<WebSocket | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) return;

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
        (typeof window !== 'undefined' ? 
          `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/` : 
          'ws://localhost:8000/ws/');
      
      const socket = new WebSocket(`${wsUrl}notifications/?token=${token}`);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          if (!pathname.includes('/chat')) toast.success('Yangi xabar! ✉️');
          window.dispatchEvent(new CustomEvent('refresh-unread-counts'));
        }
        if (data.type === 'order_update') {
          toast.success(data.created ? 'Yangi buyurtma! 📦' : 'Buyurtma yangilandi! ✅');
          if (pathname.includes('/orders') || pathname.includes('/dashboard')) {
            window.dispatchEvent(new CustomEvent('refresh-orders'));
          }
        }
      };

      socket.onclose = () => {
        console.log('Notification Socket closed. Reconnecting...');
        reconnectTimer = setTimeout(connect, 5000);
      };
      
      socket.onopen = () => {
        console.log('Notification Socket connected.');
      };
    };

    connect();

    // Heartbeat ping every 30s to keep connection alive
    const pingInterval = setInterval(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      clearTimeout(reconnectTimer);
      socketRef.current?.close();
    };
  }, [token, pathname]);

  return (
    <RealtimeContext.Provider value={{}}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);
