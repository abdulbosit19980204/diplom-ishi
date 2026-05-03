'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  BarChart3, Settings, ChevronLeft, ChevronRight, LogOut, Users,
  History as HistoryIcon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

// ─── Nav config ──────────────────────────────────────────────
// roles: which roles CAN see this item. Empty/undefined = everyone.
// ADMIN, MANAGER, CUSTOMER + superuser is handled server-side.
type Role = 'ADMIN' | 'MANAGER' | 'CUSTOMER';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: Role[];       // allowed roles; absent = all roles
}

interface NavSection {
  label: string;
  roles?: Role[];       // if set, entire section is gated
  items: NavItem[];
}

const NAV_CONFIG: NavSection[] = [
  {
    label: 'Asosiy',
    items: [
      { name: 'Bosh sahifa', href: '/dashboard', icon: LayoutDashboard },
      { name: "Do'kon",      href: '/shop',      icon: Package },
      { name: 'Xabarlar',    href: '/chat',      icon: MessageSquare },
      { name: 'Analitika',   href: '/analytics', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    label: "Do'kon",
    items: [
      { name: 'Mahsulotlar', href: '/products',  icon: Package },
      { name: 'Buyurtmalar', href: '/orders',    icon: ShoppingCart },
      { name: 'Ombor',       href: '/inventory', icon: HistoryIcon, roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    label: 'Boshqaruv',
    roles: ['ADMIN', 'MANAGER'],          // section only visible to these roles
    items: [
      { name: 'Foydalanuvchilar', href: '/users', icon: Users, roles: ['ADMIN'] },
    ],
  },
];

// ─── Helper: can the user see this item? ──────────────────────
function canSee(required: Role[] | undefined, role: string | null, isSuperuser: boolean): boolean {
  if (isSuperuser) return true;                                   // superuser sees everything
  if (!required || required.length === 0) return true;           // no restriction
  if (!role) return false;
  return required.includes(role as Role);
}

// ─── Component ───────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const { logout, role, username, isSuperuser } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const fetchUnread = () => {
       api.get('chat/unread-count/').then(r => setUnreadCount(r.data.count)).catch(() => {});
    };
    fetchUnread();
    
    // Listen for global real-time events
    window.addEventListener('refresh-unread-counts', fetchUnread);
    return () => window.removeEventListener('refresh-unread-counts', fetchUnread);
  }, []);

  if (['/', '/login', '/register'].includes(pathname)) return null;
  if (!mounted) return <div className="w-[220px] shrink-0 h-screen sticky top-0" style={{ background: 'var(--bg-surface)' }} />;

  const handleLogout = () => { logout(); router.push('/login'); };

  // Filter nav config by role
  const visibleNav = NAV_CONFIG
    .filter(section => canSee(section.roles, role, isSuperuser))
    .map(section => ({
      ...section,
      items: section.items.filter(item => canSee(item.roles, role, isSuperuser)),
    }))
    .filter(section => section.items.length > 0);

  const roleColors: Record<string, string> = {
    ADMIN:    'var(--brand)',
    MANAGER:  'var(--success)',
    CUSTOMER: 'var(--warning)',
  };
  const roleLabels: Record<string, string> = {
    ADMIN: 'Admin', MANAGER: 'Menejer', CUSTOMER: 'Mijoz', SUPERUSER: 'Superuser'
  };

  return (
    <aside className="w-[220px] flex flex-col border-r shrink-0 h-screen sticky top-0"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>

      {/* ── Logo ── */}
      <div className="h-14 flex items-center px-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-7 h-7 rounded-lg brand-gradient flex items-center justify-center mr-2.5 glow-brand">
          <span className="text-white font-black text-sm">S</span>
        </div>
        <span className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>ShopAdmin</span>
      </div>

      {/* ── User pill ── */}
      <div className="mx-3 mt-3 px-3 py-2.5 rounded-xl flex items-center gap-2.5"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {username?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {username ?? 'Foydalanuvchi'}
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: roleColors[role ?? ''] ?? 'var(--text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: roleColors[role ?? ''] ?? 'var(--text-muted)' }} />
            {roleLabels[role ?? ''] ?? 'Mehmon'}
          </span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto p-3 mt-2 space-y-4">
        {visibleNav.map(section => (
          <div key={section.label}>
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}>
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.name}>
                    <Link href={item.href} className={`nav-link ${active ? 'active' : ''}`}>
                      <item.icon size={28} strokeWidth={active ? 2.2 : 1.8} />
                      {item.name}
                      {item.name === 'Xabarlar' && unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[12px] font-black px-2.5 py-1 rounded-full min-w-[24px] text-center shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                          {unreadCount}
                        </span>
                      )}
                      {active && ! (item.name === 'Xabarlar' && unreadCount > 0) && <ChevronRight size={18} className="ml-auto opacity-40" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="p-3 border-t space-y-0.5" style={{ borderColor: 'var(--border)' }}>
        <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}>
          <Settings size={28} />
          Sozlamalar
        </Link>
        <button className="nav-link w-full text-left" style={{ color: 'var(--danger)' }} onClick={handleLogout}>
          <LogOut size={28} />
          Chiqish
        </button>
      </div>
    </aside>
  );
}
