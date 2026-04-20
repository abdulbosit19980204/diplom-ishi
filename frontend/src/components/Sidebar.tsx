'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  Settings, ChevronRight, BarChart3, Users
} from 'lucide-react';

const nav = [
  { label: 'Overview',  items: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ]},
  { label: 'Commerce',  items: [
    { name: 'Products',  href: '/products',  icon: Package },
    { name: 'Orders',    href: '/orders',    icon: ShoppingCart },
    { name: 'Customers', href: '/customers', icon: Users },
  ]},
  { label: 'Support',   items: [
    { name: 'Messages',  href: '/chat',      icon: MessageSquare },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();
  if (['/', '/login', '/register'].includes(pathname)) return null;

  return (
    <aside className="sidebar-full w-[220px] flex flex-col border-r shrink-0 h-screen sticky top-0" style={{ background:'var(--bg-surface)', borderColor:'var(--border)' }}>
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b" style={{ borderColor:'var(--border)' }}>
        <div className="w-7 h-7 rounded-lg brand-gradient flex items-center justify-center mr-2.5 glow-brand">
          <span className="text-white font-black text-sm">S</span>
        </div>
        <span className="font-semibold text-[15px]" style={{ color:'var(--text-primary)' }}>ShopAdmin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {nav.map(section => (
          <div key={section.label}>
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color:'var(--text-muted)' }}>
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.name}>
                    <Link href={item.href} className={`nav-link ${active ? 'active' : ''}`}>
                      <item.icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                      {item.name}
                      {active && <ChevronRight size={12} className="ml-auto opacity-50" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor:'var(--border)' }}>
        <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}>
          <Settings size={16} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
