'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingCart, Users, DollarSign,
  Package, ArrowUpRight, ArrowDownRight, AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { username } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('analytics/').then(r => setStats(r.data)).catch(() => {}),
      api.get('orders/').then(r => setOrders(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const kpis = [
    {
      label: "Umumiy daromad",
      value: stats ? `$${Number(stats.stats.total_revenue).toLocaleString()}` : '—',
      icon: DollarSign, glow: 'kpi-glow-blue', up: true, delta: ''
    },
    {
      label: "Barcha buyurtmalar",
      value: stats ? stats.stats.total_orders : '—',
      icon: ShoppingCart, glow: 'kpi-glow-purple', up: true, delta: ''
    },
    {
      label: "Mahsulotlar",
      value: stats ? stats.stats.total_products : '—',
      icon: Package, glow: 'kpi-glow-green', up: true, delta: ''
    },
    {
      label: "Mijozlar",
      value: stats ? stats.stats.total_customers : '—',
      icon: Users, glow: 'kpi-glow-amber', up: true, delta: ''
    },
  ];

  const statusLabels: Record<string, string> = {
    PENDING: "Kutilmoqda",
    ACCEPTED: "Qabul qilingan",
    SHIPPED: "Yetkazilmoqda",
    DELIVERED: "Yetkazilgan",
  };

  const statusColors: Record<string, string> = {
    PENDING: 'var(--warning)',
    ACCEPTED: 'var(--brand)',
    SHIPPED: 'var(--info)',
    DELIVERED: 'var(--success)',
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Sarlavha */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Xush kelibsiz, {username ?? 'Admin'} 👋
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
          Bugungi do'koningiz holati bilan tanishing.
        </p>
      </div>

      {/* KPI Kartalar */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            className={`card p-5 relative overflow-hidden ${k.glow}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <k.icon size={15} className="text-indigo-400" />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {loading ? <span className="skeleton block h-7 w-24 rounded" /> : k.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Past status + Kam qolgan mahsulotlar */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Buyurtma holatlari */}
        <motion.div className="card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Buyurtma holatlari</h3>
          <div className="space-y-3">
            {stats && Object.entries(stats.status_counts).map(([key, val]: any) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-24 text-[12px]" style={{ color: 'var(--text-muted)' }}>{statusLabels[key]}</div>
                <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--bg-overlay)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: statusColors[key] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.stats.total_orders ? (val / stats.stats.total_orders) * 100 : 0}%` }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  />
                </div>
                <div className="w-6 text-right text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{val}</div>
              </div>
            ))}
            {!stats && <div className="skeleton h-24 rounded-lg" />}
          </div>
        </motion.div>

        {/* Eng ko'p sotilgan mahsulotlar */}
        <motion.div className="card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Eng ko'p sotilgan mahsulotlar
          </h3>
          <div className="space-y-3">
            {stats?.top_products?.length > 0
              ? stats.top_products.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold text-indigo-400"
                    style={{ background: 'rgba(99,102,241,0.1)' }}>
                    {i + 1}
                  </div>
                  <p className="flex-1 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    {p.product__name ?? 'Noma\'lum'}
                  </p>
                  <span className="text-[12px] font-semibold text-green-400">{p.sold} ta</span>
                </div>
              ))
              : <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
                  Hali sotilgan mahsulotlar yo'q
                </p>
            }
          </div>
        </motion.div>
      </div>

      {/* Oxirgi buyurtmalar */}
      <motion.div className="card overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Oxirgi buyurtmalar</h3>
          <a href="/orders" className="text-[13px] text-indigo-400 hover:text-indigo-300 transition">Barchasini ko'rish →</a>
        </div>
        <table className="table-base">
          <thead>
            <tr>
              <th>Buyurtma №</th>
              <th>Mijoz</th>
              <th>Holati</th>
              <th>Sana</th>
              <th className="text-right">Summa</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(5).fill(0).map((_, i) => (
                <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j}><div className="skeleton h-4 w-full rounded" /></td>)}</tr>
              ))
              : orders.slice(0, 6).map((o: any, i: number) => (
                <tr key={i}>
                  <td className="strong font-mono text-[13px]">#{String(o.id).padStart(4, '0')}</td>
                  <td className="strong">{o.user_name}</td>
                  <td>
                    <span className={`badge badge-${o.status.toLowerCase()}`}>
                      {statusLabels[o.status] ?? o.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {new Date(o.created_at).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="text-right strong">${o.total_price}</td>
                </tr>
              ))
            }
            {!loading && orders.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Buyurtmalar yo'q</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Kam qolgan mahsulotlar ogohlantirishi */}
      {stats && stats.stats.low_stock > 0 && (
        <motion.div
          className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.2)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
          <p className="text-[13px]" style={{ color: 'var(--warning)' }}>
            <strong>{stats.stats.low_stock} ta mahsulot</strong> ozayib ketgan (10 tadan kam). Omborda to'ldirish kerak!
          </p>
        </motion.div>
      )}
    </div>
  );
}
