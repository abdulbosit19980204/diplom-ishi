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

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
      (typeof window !== 'undefined' ? 
        `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/` : 
        'ws://localhost:8000/ws/');
    const socket = new WebSocket(`${wsUrl}notifications/?token=${token}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Realtime Update:', data);

      // Handle different notification types
      if (data.type === 'new_message') {
        // Only toast if not on the chat page
        if (!pathname.includes('/chat')) {
          toast.success('Yangi xabar keldi! ✉️', { duration: 4000 });
        }
        // Dispatch global event for components to refresh unread counts
        window.dispatchEvent(new CustomEvent('refresh-unread-counts'));
      }

      if (data.type === 'order_update') {
        const msg = data.created ? 'Yangi buyurtma qabul qilindi! 📦' : `Buyurtma statusi o'zgardi: ${data.status} ✅`;
        toast.success(msg, { icon: '📦', duration: 5000 });
        
        // Refresh the orders list if on orders or dashboard page
        if (pathname.includes('/orders') || pathname.includes('/dashboard')) {
           window.dispatchEvent(new CustomEvent('refresh-orders'));
        }
      }
    };

    socket.onclose = () => {
      console.log('Notification Socket closed. Reconnecting in 5s...');
      setTimeout(() => {
        // Simple reconnect logic
      }, 5000);
    };

    return () => {
      socket.close();
    };
  }, [token, pathname]);

  return (
    <RealtimeContext.Provider value={{}}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);
