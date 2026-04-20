'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, X, CheckCircle2, Clock, Truck, Package } from 'lucide-react';

const statusFlow = [
  { key:'pending',   label:'Pending',   icon:Clock,         color:'var(--warning)' },
  { key:'accepted',  label:'Accepted',  icon:CheckCircle2,  color:'var(--brand)' },
  { key:'shipped',   label:'Shipped',   icon:Truck,         color:'var(--info)' },
  { key:'delivered', label:'Delivered', icon:CheckCircle2,  color:'var(--success)' },
];

export default function OrdersPage() {
  const [orders, setOrders]     = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

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
    await api.patch(`orders/${id}/`, { status });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (selected?.id === id) setSelected((prev: any) => ({ ...prev, status }));
  };

  return (
    <div className="p-6 max-w-[1400px] flex gap-5 h-[calc(100vh-56px)] overflow-hidden">
      {/* List */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {statusFlow.map(s => (
            <div key={s.key} className="card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color:'var(--text-muted)' }}>{s.label}</p>
              <p className="text-xl font-bold mt-1" style={{ color: s.color }}>
                {loading ? '—' : orders.filter(o => o.status === s.key).length}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }} />
          <input className="input pl-9" placeholder="Search orders or customers…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="card overflow-auto flex-1">
          <table className="table-base">
            <thead><tr><th>ID</th><th>Customer</th><th>Status</th><th>Date</th><th className="text-right">Total</th></tr></thead>
            <tbody>
              {loading
                ? Array(6).fill(0).map((_,i) => (
                  <tr key={i}>{Array(5).fill(0).map((_,j) => <td key={j}><div className="skeleton h-4" /></td>)}</tr>
                ))
                : filtered.map((o, i) => (
                  <motion.tr key={o.id}
                    className={`cursor-pointer ${selected?.id===o.id ? 'ring-1 ring-inset ring-indigo-500/30' : ''}`}
                    style={{ background: selected?.id===o.id ? 'rgba(99,102,241,0.05)' : '' }}
                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}
                    onClick={() => setSelected(o)}
                  >
                    <td className="strong font-mono text-[13px]">#{String(o.id).padStart(4,'0')}</td>
                    <td className="strong">{o.user_name}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="text-right strong">${o.total_price}</td>
                  </motion.tr>
                ))
              }
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10" style={{ color:'var(--text-muted)' }}>No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            className="w-[340px] card flex flex-col shrink-0 overflow-y-auto"
            initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:24 }}
            transition={{ type:'spring', stiffness:300, damping:28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor:'var(--border)' }}>
              <div>
                <p className="font-semibold" style={{ color:'var(--text-primary)' }}>Order #{String(selected.id).padStart(4,'0')}</p>
                <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{selected.user_name}</p>
              </div>
              <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>

            {/* Timeline */}
            <div className="p-4 border-b" style={{ borderColor:'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color:'var(--text-muted)' }}>Progress</p>
              <div className="relative">
                {statusFlow.map((s, i) => {
                  const si = statusFlow.findIndex(x => x.key === selected.status);
                  const done = i <= si;
                  return (
                    <div key={s.key} className="flex gap-3 items-start mb-4 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center ring-2 transition-all"
                          style={{
                            background: done ? s.color : 'var(--bg-overlay)',
                            boxShadow: done ? `0 0 10px ${s.color}66, 0 0 0 2px ${s.color}44` : '0 0 0 2px var(--border)'
                          }}>
                          <s.icon size={12} color={done ? '#fff' : 'var(--text-muted)'} />
                        </div>
                        {i < statusFlow.length-1 && (
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
            </div>

            {/* Quick Update */}
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color:'var(--text-muted)' }}>Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                {statusFlow.map(s => (
                  <button key={s.key}
                    className={`btn text-xs py-2 ${selected.status===s.key ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateStatus(selected.id, s.key)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-4 pt-0">
              <div className="surface-elevated rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span style={{ color:'var(--text-muted)' }}>Order Total</span>
                  <span className="font-semibold" style={{ color:'var(--text-primary)' }}>${selected.total_price}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color:'var(--text-muted)' }}>Date</span>
                  <span style={{ color:'var(--text-secondary)' }}>{new Date(selected.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
