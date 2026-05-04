'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  BarChart3, Settings, LogOut, Users, History as HistoryIcon,
  ChevronRight, X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

type Role = 'ADMIN' | 'MANAGER' | 'CUSTOMER';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: Role[];
}

interface NavSection {
  label: string;
  roles?: Role[];
  items: NavItem[];
}

const NAV_CONFIG: NavSection[] = [
  {
    label: 'Asosiy',
    items: [
      { name: 'Bosh sahifa', href: '/dashboard', icon: LayoutDashboard },
      { name: "Do'kon",      href: '/shop',      icon: Package },
      { name: 'Xabarlar',    href: '/chat',      icon: MessageSquare },
      { name: 'Analitika',   icon: BarChart3,    href: '/analytics', roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    label: "Boshqaruv",
    items: [
      { name: 'Mahsulotlar', href: '/products',  icon: Package },
      { name: 'Buyurtmalar', href: '/orders',    icon: ShoppingCart },
      { name: 'Ombor',       href: '/inventory', icon: HistoryIcon, roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    label: 'Tizim',
    roles: ['ADMIN'],
    items: [
      { name: 'Foydalanuvchilar', href: '/users', icon: Users },
    ],
  },
];

function canSee(required: Role[] | undefined, role: string | null, isSuperuser: boolean): boolean {
  if (isSuperuser) return true;
  if (!required || required.length === 0) return true;
  if (!role) return false;
  return required.includes(role as Role);
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, role, username, isSuperuser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const fetchUnread = () => api.get('chat/unread-count/').then(r => setUnreadCount(r.data.count)).catch(() => {});
    const fetchPending = () => api.get('orders/pending-count/').then(r => setPendingOrdersCount(r.data.count)).catch(() => {});

    fetchUnread();
    fetchPending();

    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('toggle-sidebar', handleToggle);
    window.addEventListener('close-sidebar', handleClose);
    window.addEventListener('refresh-unread-counts', fetchUnread);
    window.addEventListener('refresh-orders', fetchPending);

    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('close-sidebar', handleClose);
      window.removeEventListener('refresh-unread-counts', fetchUnread);
      window.removeEventListener('refresh-orders', fetchPending);
    };
  }, []);

  if (['/', '/login', '/register'].includes(pathname)) return null;
  if (!mounted) return null;

  const handleLogout = () => { logout(); router.push('/login'); };

  const visibleNav = NAV_CONFIG
    .filter(s => canSee(s.roles, role, isSuperuser))
    .map(s => ({
      ...s,
      items: s.items.filter(i => canSee(i.roles, role, isSuperuser))
    }))
    .filter(s => s.items.length > 0);

  const roleLabels: any = { ADMIN: 'Admin', MANAGER: 'Menejer', CUSTOMER: 'Mijoz' };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[60] w-[280px] lg:w-[240px] flex flex-col border-r h-screen
        transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) bg-[#0a0a0c] border-white/5
        ${isOpen ? 'translate-x-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-black text-xl italic">S</span>
             </div>
             <div>
                <h1 className="font-black text-lg tracking-tighter leading-none">ROBIYA</h1>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em]">Marketplace</p>
             </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-9 custom-scrollbar scroll-smooth">
          {visibleNav.map((section) => (
            <div key={section.label} className="space-y-3">
              <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-gray-600">
                {section.label}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group relative ${
                        isActive 
                          ? 'bg-indigo-500/10 text-indigo-400' 
                          : 'text-gray-500 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon size={20} className={`${isActive ? 'scale-110 text-indigo-400' : 'group-hover:scale-110'} transition-transform duration-500`} />
                        <span className={`text-[14px] font-bold tracking-tight ${isActive ? 'text-white' : ''}`}>
                          {item.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.href === '/chat' && unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-black min-w-[20px] h-[20px] flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                        {item.href === '/orders' && pendingOrdersCount > 0 && (
                          <span className="bg-amber-500 text-white text-[10px] font-black min-w-[20px] h-[20px] flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                            {pendingOrdersCount}
                          </span>
                        )}
                        {isActive && (
                           <motion.div layoutId="nav-glow" className="absolute inset-0 bg-indigo-500/5 rounded-2xl -z-10" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/20 space-y-4">
           <Link href="/settings" onClick={() => setIsOpen(false)} className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${pathname === '/settings' ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-white'}`}>
              <Settings size={20} />
              <span className="text-[14px] font-bold">Sozlamalar</span>
           </Link>

           <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5">
              <div className="w-11 h-11 rounded-2xl brand-gradient flex items-center justify-center text-white font-black text-lg shadow-xl">
                 {(username || 'A')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                 <p className="text-[14px] font-black truncate text-white leading-none mb-1.5">{username}</p>
                 <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest">
                    {roleLabels[role || 'CUSTOMER']}
                 </span>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                 <LogOut size={20} />
              </button>
           </div>
        </div>
      </aside>
    </>
  );
}
