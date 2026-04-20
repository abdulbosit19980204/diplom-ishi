'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, X, CheckCircle2, Clock, Truck, Package, ChevronRight, MessageSquare } from 'lucide-react';

const statusFlow = [
  { key: 'PENDING',   label: 'Kutilmoqda',       icon: Clock,         color: 'var(--warning)' },
  { key: 'ACCEPTED',  label: 'Qabul qilingan',    icon: CheckCircle2,  color: 'var(--brand)'   },
  { key: 'SHIPPED',   label: 'Yetkazilmoqda',     icon: Truck,         color: 'var(--info)'    },
  { key: 'DELIVERED', label: 'Yetkazib berilgan', icon: CheckCircle2,  color: 'var(--success)' },
];

export default function OrdersPage() {
  const [orders, setOrders]     = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get('orders/')
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o =>
    o.id?.toString().includes(search) ||
    o.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id: number, status: string) => {
    setUpdating(true);
    try {
      await api.patch(`orders/${id}/`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selected?.id === id) setSelected((p: any) => ({ ...p, status }));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] flex gap-5 h-[calc(100vh-56px)] overflow-hidden">
      {/* List panel */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Status cards */}
        <div className="grid grid-cols-4 gap-3">
          {statusFlow.map(s => (
            <div key={s.key} className="card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {s.label}
              </p>
              <p className="text-xl font-bold mt-1" style={{ color: s.color }}>
                {loading ? '—' : orders.filter(o => o.status === s.key).length}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-9" placeholder="Buyurtma ID yoki mijoz ismi…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="card overflow-auto flex-1">
          <table className="table-base">
            <thead>
              <tr>
                <th>Buyurtma №</th>
                <th>Mijoz</th>
                <th>Holati</th>
                <th>Sana</th>
                <th className="text-right">Jami</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(6).fill(0).map((_, i) => (
                  <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>
                ))
                : filtered.map((o, i) => {
                  const s = statusFlow.find(x => x.key === o.status);
                  return (
                    <motion.tr key={o.id}
                      className="cursor-pointer"
                      style={{ background: selected?.id === o.id ? 'rgba(99,102,241,0.05)' : '' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      onClick={() => setSelected(o)}
                    >
                      <td className="strong font-mono text-[13px]">#{String(o.id).padStart(4, '0')}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full brand-gradient flex items-center justify-center text-white text-[11px] font-bold">
                            {o.user_name?.[0]?.toUpperCase()}
                          </div>
                          <span className="strong">{o.user_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${o.status.toLowerCase()}`}>{s?.label ?? o.status}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {new Date(o.created_at).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="text-right strong">${o.total_price}</td>
                    </motion.tr>
                  );
                })
              }
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                  Buyurtmalar topilmadi.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <motion.aside className="w-[320px] card flex flex-col shrink-0 overflow-y-auto"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Buyurtma #{String(selected.id).padStart(4, '0')}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{selected.user_name}</p>
              </div>
              <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>

            {/* Primary Actions */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="space-y-2">
                {selected.status === 'PENDING' && (
                  <button className="btn btn-primary w-full py-3 text-[14px] flex items-center justify-center gap-2"
                    onClick={() => updateStatus(selected.id, 'ACCEPTED')} disabled={updating}>
                    <CheckCircle2 size={16} /> Qabul qilish
                  </button>
                )}
                {selected.status === 'ACCEPTED' && (
                  <button className="btn btn-primary w-full py-3 text-[14px] flex items-center justify-center gap-2"
                    onClick={() => updateStatus(selected.id, 'SHIPPED')} disabled={updating}>
                    <Truck size={16} /> Yo'lga chiqarish
                  </button>
                )}
                {selected.status === 'SHIPPED' && (
                  <button className="btn btn-primary w-full py-3 text-[14px] flex items-center justify-center gap-2"
                    onClick={() => updateStatus(selected.id, 'DELIVERED')} disabled={updating}>
                    <Package size={16} /> Yetkazilganini tasdiqlash
                  </button>
                )}
                
                <Link href={`/chat?orderId=${selected.id}&userId=${selected.user}&name=${selected.user_name}`} className="block">
                  <button className="btn btn-secondary w-full py-3 text-[14px] flex items-center justify-center gap-2 mt-2">
                    <MessageSquare size={16} /> Mijoz bilan bog'lanish
                  </button>
                </Link>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Jarayon</p>
              {statusFlow.map((s, i) => {
                const si = statusFlow.findIndex(x => x.key === selected.status);
                const done = i <= si;
                return (
                  <div key={s.key} className="flex gap-3 items-start mb-4 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          background: done ? s.color : 'var(--bg-overlay)',
                          boxShadow: done ? `0 0 10px ${s.color}55, 0 0 0 2px ${s.color}33` : '0 0 0 2px var(--border)'
                        }}>
                        <s.icon size={12} color={done ? '#fff' : 'var(--text-muted)'} />
                      </div>
                      {i < statusFlow.length - 1 && (
                        <div className="w-px h-5 mt-1" style={{ background: done ? s.color : 'var(--border)' }} />
                      )}
                    </div>
                    <p className="text-[13px] pt-0.5" style={{ color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Quick update (smaller) */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                Holatni boshqarish
              </p>
              <div className="flex flex-wrap gap-1.5">
                {statusFlow.map(s => (
                  <button key={s.key}
                    disabled={updating || selected.status === s.key}
                    className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${
                      selected.status === s.key 
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                        : 'border-transparent hover:bg-white/5 text-gray-500'
                    }`}
                    onClick={() => updateStatus(selected.id, s.key)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Buyurtma tafsiloti */}
            <div className="p-4">
              <div className="surface-elevated rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-muted)' }}>Jami summa</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>${selected.total_price}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--text-muted)' }}>Sana</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {new Date(selected.created_at).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
              </div>

              {/* Mahsulotlar ro'yxati */}
              {selected.items?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Mahsulotlar</p>
                  <div className="space-y-2">
                    {selected.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-[13px] p-2 rounded-lg"
                        style={{ background: 'var(--bg-overlay)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.product_name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
