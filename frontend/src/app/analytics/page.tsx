'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingCart, Users, Package, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const { role, isSuperuser } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isSuperuser && role !== 'ADMIN' && role !== 'MANAGER') {
      router.push('/dashboard');
      return;
    }
    api.get('analytics/').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [role, isSuperuser, router]);

  const statuses = [
    { key: 'PENDING',   label: 'Kutilmoqda',       color: 'var(--warning)' },
    { key: 'ACCEPTED',  label: 'Qabul qilingan',    color: 'var(--brand)'   },
    { key: 'SHIPPED',   label: 'Yetkazilmoqda',     color: 'var(--info)'    },
    { key: 'DELIVERED', label: 'Yetkazib berilgan', color: 'var(--success)' },
  ];

  const kpis = [
    { label: "Umumiy daromad",  value: data ? `$${Number(data.stats.total_revenue).toLocaleString()}` : '—', icon: TrendingUp,  glow: 'kpi-glow-blue'   },
    { label: "Jami buyurtmalar",value: data ? data.stats.total_orders    : '—',                               icon: ShoppingCart, glow: 'kpi-glow-purple' },
    { label: "Mahsulotlar",     value: data ? data.stats.total_products  : '—',                               icon: Package,      glow: 'kpi-glow-green'  },
    { label: "Mijozlar",        value: data ? data.stats.total_customers : '—',                               icon: Users,        glow: 'kpi-glow-amber'  },
  ];

  if (!mounted) return <div className="p-12"><div className="skeleton h-64 rounded-2xl" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analitika</h1>
        <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>Do'koningizning batafsil ko'rsatkichlari.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} className={`card p-5 ${k.glow}`}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
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

      {/* Two panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Buyurtma holatlari */}
        <motion.div className="card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Buyurtma holatlari bo'yicha taqsimot</h3>
          {loading
            ? <div className="skeleton h-32 rounded-lg" />
            : data && (
              <div className="space-y-4">
                {statuses.map(s => {
                  const count = data.status_counts[s.key] ?? 0;
                  const percent = data.stats.total_orders ? Math.round((count / data.stats.total_orders) * 100) : 0;
                  return (
                    <div key={s.key}>
                      <div className="flex justify-between text-[13px] mb-1.5">
                        <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                        <span className="font-semibold" style={{ color: s.color }}>{count} ({percent}%)</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: 'var(--bg-overlay)' }}>
                        <motion.div className="h-full rounded-full"
                          style={{ background: s.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.7, delay: 0.4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </motion.div>

        {/* Eng ko'p sotilganlar */}
        <motion.div className="card p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <h3 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Eng ko'p sotilgan mahsulotlar</h3>
          {loading
            ? <div className="skeleton h-32 rounded-lg" />
            : data?.top_products?.length > 0
              ? (
                <div className="space-y-3">
                  {data.top_products.map((p: any, i: number) => {
                    const maxSold = data.top_products[0]?.sold ?? 1;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-[13px] mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold text-indigo-400"
                              style={{ background: 'rgba(99,102,241,0.1)' }}>{i + 1}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{p.product__name}</span>
                          </div>
                          <span className="font-semibold text-green-400">{p.sold} ta</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-overlay)' }}>
                          <motion.div className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(p.sold / maxSold) * 100}%` }}
                            transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
              : <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Hali sotilgan mahsulotlar yo'q</p>
          }
        </motion.div>
      </div>

      {/* Monthly chart */}
      <motion.div className="card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Oylik daromad dinamikasi</h3>
        <p className="text-[12px] mb-6" style={{ color: 'var(--text-muted)' }}>Yetkazib berilgan buyurtmalar asosida hisoblangan</p>

        {loading
          ? <div className="skeleton h-36 rounded-lg" />
          : data?.monthly_data?.length > 0
            ? (
              <div className="flex items-end gap-3 h-36">
                {data.monthly_data.map((m: any, i: number) => {
                  const max = Math.max(...data.monthly_data.map((x: any) => x.revenue), 1);
                  const pct = (m.revenue / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <p className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>${m.revenue}</p>
                      <motion.div className="w-full rounded-t-sm"
                        style={{ background: 'linear-gradient(180deg,#818cf8,#6366f1)' }}
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.07 }} />
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.month.slice(5)}</p>
                    </div>
                  );
                })}
              </div>
            )
            : (
              <div className="h-36 flex flex-col items-center justify-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Hali yetkazib berilgan buyurtmalar yo'q</p>
              </div>
            )
        }
      </motion.div>

      {/* Low stock warning */}
      {data && data.stats.low_stock > 0 && (
        <motion.div className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.2)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
          <p className="text-[13px]" style={{ color: 'var(--warning)' }}>
            <strong>{data.stats.low_stock} ta mahsulot</strong> omborda 10 tadan kam qolgan. Tezda to'ldiring!
          </p>
        </motion.div>
      )}
    </div>
  );
}
