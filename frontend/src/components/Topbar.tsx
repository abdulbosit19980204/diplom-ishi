'use client';
import { useEffect, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ThemeToggle from '@/components/ThemeToggle';
import api from '@/lib/api';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Bosh sahifa',
  '/analytics': 'Analitika',
  '/products':  'Mahsulotlar',
  '/orders':    'Buyurtmalar',
  '/chat':      'Xabarlar',
  '/settings':  'Sozlamalar',
};

export default function Topbar() {
  const pathname = usePathname();
  const { username, role, isSuperuser } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
       api.get('chat/unread-count/').then(r => setUnreadCount(r.data.count)).catch(() => {});
    };
    fetchUnread();
    const timer = setInterval(fetchUnread, 30000);
    return () => clearInterval(timer);
  }, []);

  if (['/', '/login', '/register'].includes(pathname)) return null;

  const roleNames: Record<string, string> = {
    ADMIN: 'Admin',
    MANAGER: 'Menejer',
    CUSTOMER: 'Mijoz',
  };

  const currentRoleLabel = isSuperuser ? 'Superuser' : (roleNames[role ?? ''] ?? 'Foydalanuvchi');

  const title = pageTitles[pathname] ?? 'Dashboard';

  return (
    <header className="h-14 flex items-center px-6 gap-4 border-b sticky top-0 z-40 glass"
      style={{ borderColor: 'var(--border)' }}>
      <h2 className="font-semibold text-[15px] mr-auto" style={{ color: 'var(--text-primary)' }}>{title}</h2>

      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input w-56 pl-9 py-1.5 text-sm" placeholder="Qidirish…" />
      </div>

      <ThemeToggle />

      <button className="btn btn-ghost relative w-12 h-12 p-0 rounded-2xl hover:bg-white/10 transition-all active:scale-95 group">
        <Bell size={28} className="text-gray-100 group-hover:text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[12px] font-black px-1.5 rounded-full min-w-[20px] h-[20px] flex items-center justify-center border-2 border-[#0f172a] shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <div className="h-6 w-px" style={{ background: 'var(--border-md)' }} />

      <div className="flex items-center gap-2.5 cursor-pointer group">
        <div className="text-right hidden sm:block">
          <p className="text-[13px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>
            {username || 'Mehmon'}
          </p>
          <p className="text-[11px] capitalize" style={{ color: 'var(--brand)' }}>
            {currentRoleLabel}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent group-hover:ring-indigo-500/30 transition-all">
          {username?.[0]?.toUpperCase() ?? 'M'}
        </div>
      </div>
    </header>
  );
}
