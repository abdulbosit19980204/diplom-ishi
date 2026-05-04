'use client';
import { useEffect, useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
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
  '/shop':      "Do'kon",
};

export default function Topbar() {
  const pathname = usePathname();
  const { username, role, isSuperuser } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchUnread = () => {
       api.get('chat/unread-count/').then(r => setUnreadCount(r.data.count)).catch(() => {});
    };
    fetchUnread();
    
    window.addEventListener('refresh-unread-counts', fetchUnread);
    return () => window.removeEventListener('refresh-unread-counts', fetchUnread);
  }, []);

  if (['/', '/login', '/register'].includes(pathname)) return null;
  if (!mounted) return <header className="h-14 border-b glass" style={{ borderColor: 'var(--border)' }} />;

  const roleNames: Record<string, string> = {
    ADMIN: 'Admin',
    MANAGER: 'Menejer',
    CUSTOMER: 'Mijoz',
  };

  const currentRoleLabel = isSuperuser ? 'Superuser' : (roleNames[role ?? ''] ?? 'Foydalanuvchi');
  const title = pageTitles[pathname] ?? 'Dashboard';

  return (
    <header className="h-14 flex items-center px-4 md:px-6 gap-3 md:gap-4 border-b sticky top-0 z-40 glass"
      style={{ borderColor: 'var(--border)' }}>
      
      {/* ── Mobile Menu Toggle ── */}
      <button 
        className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-white/5 active:scale-95 transition-all"
        onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
      >
        <Menu size={20} style={{ color: 'var(--text-primary)' }} />
      </button>

      {/* ── Mobile Logo (Optional) ── */}
      <div className="lg:hidden w-7 h-7 rounded-lg brand-gradient flex items-center justify-center glow-brand shrink-0">
        <span className="text-white font-black text-[12px]">S</span>
      </div>

      <h2 className="font-semibold text-[14px] md:text-[15px] mr-auto truncate max-w-[120px] md:max-w-none" 
        style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>

      <div className="relative hidden lg:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input w-56 pl-9 py-1.5 text-sm" placeholder="Qidirish…" />
      </div>

      <div className="flex items-center gap-1.5 md:gap-3 ml-auto">
        <ThemeToggle />

        <button className="relative p-2 rounded-xl hover:bg-white/5 transition-all group">
          <Bell size={22} className="text-gray-300 group-hover:text-white" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#0f172a] animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="h-5 w-px hidden md:block" style={{ background: 'var(--border-md)' }} />

        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>
              {username || 'Mehmon'}
            </p>
            <p className="text-[10px] capitalize" style={{ color: 'var(--brand)' }}>
              {currentRoleLabel}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent group-hover:ring-indigo-500/30 transition-all">
            {username?.[0]?.toUpperCase() ?? 'M'}
          </div>
        </div>
      </div>
    </header>
  );
}
