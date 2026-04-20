'use client';
import { Bell, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

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
  const { username, role } = useAuthStore();

  if (['/', '/login', '/register'].includes(pathname)) return null;

  const roleNames: Record<string, string> = {
    ADMIN: 'Admin',
    MANAGER: 'Menejer',
    CUSTOMER: 'Mijoz',
  };

  const title = pageTitles[pathname] ?? 'Dashboard';

  return (
    <header className="h-14 flex items-center px-6 gap-4 border-b sticky top-0 z-40 glass"
      style={{ borderColor: 'var(--border)' }}>
      <h2 className="font-semibold text-[15px] mr-auto" style={{ color: 'var(--text-primary)' }}>{title}</h2>

      <div className="relative hidden md:block">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input w-56 pl-9 py-1.5 text-sm" placeholder="Qidirish…" />
      </div>

      <button className="btn btn-ghost relative w-9 h-9 p-0 rounded-lg">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand)' }} />
      </button>

      <div className="h-6 w-px" style={{ background: 'var(--border-md)' }} />

      <div className="flex items-center gap-2.5 cursor-pointer group">
        <div className="text-right hidden sm:block">
          <p className="text-[13px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>
            {username || 'Mehmon'}
          </p>
          <p className="text-[11px] capitalize" style={{ color: 'var(--brand)' }}>
            {roleNames[role ?? ''] ?? 'Foydalanuvchi'}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent group-hover:ring-indigo-500/30 transition-all">
          {username?.[0]?.toUpperCase() ?? 'M'}
        </div>
      </div>
    </header>
  );
}
