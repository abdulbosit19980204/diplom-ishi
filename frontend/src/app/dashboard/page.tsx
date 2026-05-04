'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingCart, Users, Package,
  TrendingUp, TrendingDown, ArrowUpRight, AlertTriangle,
  Clock, CheckCircle2, Truck, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { username } = useAuthStore();
  const [stats, setStats]   = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('analytics/').then(r => setStats(r.data)).catch(() => {}),
      api.get('orders/').then(r => setOrders(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`orders/${id}/`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      // Refresh stats too
      api.get('analytics/').then(r => setStats(r.data)).catch(() => {});
    } catch {}
  };

  const kpis = [
    {
      label: 'Umumiy daromad',
      value: stats ? `$${Number(stats.stats.total_revenue).toLocaleString()}` : null,
      sub: 'Yetkazilgan buyurtmalardan',
      icon: DollarSign,
      grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      glow: 'rgba(99,102,241,0.3)',
    },
    {
      label: 'Jami buyurtmalar',
      value: stats ? stats.stats.total_orders : null,
      sub: `${stats?.status_counts?.PENDING ?? 0} ta kutilmoqda`,
      icon: ShoppingCart,
      grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
      glow: 'rgba(6,182,212,0.3)',
    },
    {
      label: 'Mahsulotlar',
      value: stats ? stats.stats.total_products : null,
      sub: `${stats?.stats?.low_stock ?? 0} ta ozayib ketgan`,
      icon: Package,
      grad: 'linear-gradient(135deg,#10b981,#059669)',
      glow: 'rgba(16,185,129,0.3)',
    },
    {
      label: 'Mijozlar',
      value: stats ? stats.stats.total_customers : null,
      sub: 'Ro\'yxatdan o\'tganlar',
      icon: Users,
      grad: 'linear-gradient(135deg,#f59e0b,#ef4444)',
      glow: 'rgba(245,158,11,0.3)',
    },
  ];

  const statusLabels: Record<string, string> = {
    PENDING:   'Kutilmoqda',
    ACCEPTED:  'Qabul qilindi',
    SHIPPED:   'Yetkazilmoqda',
    DELIVERED: 'Yetkazildi',
  };

  const statusIcons: Record<string, React.ElementType> = {
    PENDING:   Clock,
    ACCEPTED:  CheckCircle2,
    SHIPPED:   Truck,
    DELIVERED: CheckCircle2,
  };

  const statusBadge: Record<string, string> = {
    PENDING:   'badge-pending',
    ACCEPTED:  'badge-active',
    SHIPPED:   'badge-shipped',
    DELIVERED: 'badge-delivered',
  };

  // Monthly chart max
  const monthlyMax = stats
    ? Math.max(...(stats.monthly_data?.map((m: any) => m.revenue) ?? [0]), 1)
    : 1;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">

      {/* ─── Welcome banner ─── */}
      <motion.div
        className="relative overflow-hidden rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-5"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.12) 60%, transparent 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        {/* glow orbs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-6 right-32 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />

        <div className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center glow-brand flex-shrink-0">
          <Sparkles size={20} color="white" />
        </div>
        <div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
            Xush kelibsiz, <span className="text-gradient">{username ?? 'Admin'}</span> 👋
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Bugun do'koningizda{' '}
            <span style={{ color: 'var(--brand)', fontWeight: 600 }}>
              {stats?.status_counts?.PENDING ?? 0} ta yangi buyurtma
            </span>{' '}
            kutilmoqda.
          </p>
        </div>
      </motion.div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} className="card p-5 group relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 260, damping: 22 }}>
            {/* Glow bg */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `radial-gradient(ellipse at top left, ${k.glow} 0%, transparent 60%)` }} />

            <div className="flex items-start justify-between mb-4 relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: k.grad, boxShadow: `0 4px 16px ${k.glow}` }}>
                <k.icon size={18} color="white" />
              </div>
              <ArrowUpRight size={14} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            </div>

            <p className="text-[12px] font-medium relative" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
            <p className="text-2xl font-bold mt-1 relative" style={{ color: 'var(--text-primary)' }}>
              {loading
                ? <span className="skeleton block h-7 w-20 rounded" />
                : k.value ?? '—'}
            </p>
            <p className="text-[11px] mt-1.5 relative" style={{ color: 'var(--text-muted)' }}>{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ─── Middle: Status + Monthly Chart ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Order status breakdown */}
        <motion.div className="card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Buyurtma holatlari</h3>
            <Link href="/orders" className="text-[12px] text-indigo-400 hover:text-indigo-300 transition">
              Ko'rish →
            </Link>
          </div>
          <div className="space-y-4">
            {(['PENDING','ACCEPTED','SHIPPED','DELIVERED'] as const).map(key => {
              const count = stats?.status_counts?.[key] ?? 0;
              const total = stats?.stats?.total_orders || 1;
              const pct   = Math.round((count / total) * 100);
              const colors: Record<string, string> = {
                PENDING:   '#f59e0b',
                ACCEPTED:  '#6366f1',
                SHIPPED:   '#38bdf8',
                DELIVERED: '#22c55e',
              };
              const Icon = statusIcons[key];
              return (
                <div key={key}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={13} style={{ color: colors[key] }} />
                    <span className="text-[13px] flex-1" style={{ color: 'var(--text-secondary)' }}>
                      {statusLabels[key]}
                    </span>
                    <span className="text-[12px] font-bold" style={{ color: colors[key] }}>
                      {loading ? '—' : count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: colors[key], boxShadow: `0 0 8px ${colors[key]}66` }}
                      initial={{ width: 0 }}
                      animate={{ width: loading ? '0%' : `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Monthly revenue bar chart */}
        <motion.div className="card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Oylik daromad</h3>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>So'nggi 6 oy</p>
            </div>
          </div>
          {loading
            ? <div className="skeleton h-28 rounded-lg" />
            : stats?.monthly_data?.length > 0
              ? (
                <div className="flex items-end gap-2 h-28">
                  {stats.monthly_data.map((m: any, i: number) => {
                    const pct = (m.revenue / monthlyMax) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                        <div className="relative w-full flex items-end justify-center"
                          style={{ height: '80px' }}>
                          <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-center"
                            style={{ fontSize: '9px', color: 'var(--text-muted)', bottom: '100%', marginBottom: 4 }}>
                            ${m.revenue}
                          </div>
                          <motion.div className="w-full rounded-t-md"
                            style={{ background: 'linear-gradient(180deg,#818cf8,#6366f1)', minHeight: 4 }}
                            initial={{ height: 0 }}
                            animate={{ height: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.45 + i * 0.06 }} />
                        </div>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {m.month?.slice(5)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )
              : (
                <div className="h-28 flex items-center justify-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Ma'lumot hali yo'q
                  </p>
                </div>
              )
          }
        </motion.div>
      </div>

      {/* ─── Bottom: Top Products + Recent Orders ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Top products */}
        <motion.div className="card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Top mahsulotlar</h3>
            <Link href="/products" className="text-[12px] text-indigo-400 hover:text-indigo-300 transition">Ko'proq →</Link>
          </div>
          <div className="space-y-3">
            {loading
              ? Array(4).fill(0).map((_,i) => <div key={i} className="skeleton h-8 rounded-lg" />)
              : stats?.top_products?.length > 0
                ? stats.top_products.slice(0,5).map((p: any, i: number) => {
                    const max = stats.top_products[0]?.sold ?? 1;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                          style={{ background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : 'var(--bg-overlay)', color: i > 2 ? 'var(--text-muted)' : 'white' }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {p.product__name ?? 'Mahsulot'}
                          </p>
                          <div className="mt-1 h-1 rounded-full" style={{ background: 'var(--bg-overlay)' }}>
                            <div className="h-full rounded-full" style={{
                              width: `${(p.sold / max) * 100}%`,
                              background: 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                            }} />
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-green-400 flex-shrink-0">{p.sold} ta</span>
                      </div>
                    );
                  })
                : <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Ma'lumot yo'q</p>
            }
          </div>
        </motion.div>

        {/* Recent orders */}
        <motion.div className="card overflow-hidden xl:col-span-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Oxirgi buyurtmalar</h3>
            <Link href="/orders" className="text-[12px] text-indigo-400 hover:text-indigo-300 transition">Barchasini ko'rish →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base w-full min-w-[600px]">
            <thead>
              <tr>
                <th>№</th>
                <th>Mijoz</th>
                <th>Holati</th>
                <th>Sana</th>
                <th className="text-right">Summa</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_,i) => (
                  <tr key={i}>{Array(5).fill(0).map((_,j) => (
                    <td key={j}><div className="skeleton h-4 rounded" /></td>
                  ))}</tr>
                ))
                : orders.slice(0, 6).map((o: any, i: number) => (
                  <tr key={i} className="cursor-pointer">
                    <td className="font-mono text-[12px] strong">#{String(o.id).padStart(4,'0')}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full brand-gradient flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {o.user_name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-[13px] strong">{o.user_name}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${statusBadge[o.status] ?? 'badge-pending'}`}>{statusLabels[o.status] ?? o.status}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(o.created_at).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {o.status === 'PENDING' && (
                          <button className="btn btn-ghost w-7 h-7 p-0 rounded-md text-green-400"
                            onClick={() => updateStatus(o.id, 'ACCEPTED')} title="Qabul qilish">
                            <CheckCircle2 size={13} />
                          </button>
                        )}
                        <Link href={`/chat?orderId=${o.id}&userId=${o.user}&name=${o.user_name}`}
                          className="btn btn-ghost w-7 h-7 p-0 rounded-md text-indigo-400 flex items-center justify-center">
                          <ArrowUpRight size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              }
            {!loading && orders.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Buyurtmalar yo'q</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </motion.div>
      </div>

      {/* ─── Low stock alert ─── */}
      {stats?.low_stock_alerts?.length > 0 && (
        <motion.div
          className="flex flex-col gap-4 p-5 rounded-2xl border"
          style={{ background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.25)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,158,11,0.15)' }}>
              <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: 'var(--warning)' }}>Omborni to'ldirish kerak!</p>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Quyidagi mahsulotlar 10 tadan kam qolgan:
              </p>
            </div>
            <Link href="/products" className="btn btn-secondary ml-auto text-[12px] py-1.5 px-3" style={{ color: 'var(--warning)', borderColor: 'rgba(245,158,11,0.3)' }}>
              Hammasini ko'rish
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.low_stock_alerts.slice(0, 6).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[13px] font-medium truncate pr-2" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                <span className="badge badge-cancelled text-[10px] whitespace-nowrap">{item.stock} ta qoldi</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
