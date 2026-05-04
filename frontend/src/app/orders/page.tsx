'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Search, X, CheckCircle2, Clock, Truck, Package, ChevronRight, MessageSquare, SlidersHorizontal } from 'lucide-react';

const statusFlow = [
  { key: 'PENDING',   label: 'Kutilmoqda',       icon: Clock,         color: 'var(--warning)' },
  { key: 'ACCEPTED',  label: 'Qabul qilingan',    icon: CheckCircle2,  color: 'var(--brand)'   },
  { key: 'SHIPPED',   label: 'Yetkazilmoqda',     icon: Truck,         color: 'var(--info)'    },
  { key: 'DELIVERED', label: 'Yetkazib berilgan', icon: CheckCircle2,  color: 'var(--success)' },
];

export default function OrdersPage() {
  const { role } = useAuthStore();
  const [orders, setOrders]     = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [status, setStatus]     = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [customerId, setCustomerId] = useState('');
  const [users, setUsers]         = useState<any[]>([]); // For customer filter

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (customerId) params.append('customer_id', customerId);

      const r = await api.get(`orders/?${params.toString()}`);
      setOrders(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [status, startDate, endDate, customerId]);

  useEffect(() => {
    setMounted(true);
    fetchOrders();
    // Load users for the filter if Admin/Manager
    if (role === 'ADMIN' || role === 'MANAGER') {
       api.get('users/').then(r => setUsers(r.data)).catch(() => {});
    }

    window.addEventListener('refresh-orders', fetchOrders);
    return () => window.removeEventListener('refresh-orders', fetchOrders);
  }, [fetchOrders, role]);

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
    <div className="p-4 md:p-6 max-w-[1400px] flex flex-col lg:flex-row gap-5 h-[calc(100vh-56px)] overflow-hidden relative">
      {/* List panel */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Status cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statusFlow.map(s => (
            <div key={s.key} className="card p-4 group hover:border-indigo-500/30 transition-all">
              <div className="flex justify-between items-start">
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </p>
                <s.icon size={14} style={{ color: s.color }} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-black mt-2" style={{ color: s.color, textShadow: `0 0 15px ${s.color}33` }}>
                {loading ? '—' : orders.filter(o => o.status === s.key).length}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
           <div className="relative w-full max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input className="input pl-9 text-sm h-10" placeholder="Buyurtma ID bo'yicha qidirish…" value={search} onChange={e => setSearch(e.target.value)} />
           </div>
           <button 
             className={`btn h-10 px-4 gap-2 text-sm transition-all w-full sm:w-auto justify-center ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
             onClick={() => setShowFilters(!showFilters)}
           >
             <SlidersHorizontal size={16} />
             {showFilters ? 'Yopish' : 'Filtrlar'}
             {(status || startDate || endDate || customerId) && <span className="w-2 h-2 rounded-full bg-red-400 ml-1" />}
           </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="card p-4 bg-surface-lighter border-dashed flex flex-wrap items-center gap-3">
                 <div className="flex flex-col gap-1">
                   <label className="text-[10px] font-bold uppercase text-gray-500 px-1">Holat</label>
                   <select className="input h-9 text-xs w-[140px]" value={status} onChange={e => setStatus(e.target.value)}>
                      <option value="">Barcha holatlar</option>
                      {statusFlow.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                   </select>
                 </div>

                 {(role === 'ADMIN' || role === 'MANAGER') && (
                   <div className="flex flex-col gap-1">
                     <label className="text-[10px] font-bold uppercase text-gray-500 px-1">Mijoz</label>
                     <select className="input h-9 text-xs w-[160px]" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                        <option value="">Barcha mijozlar</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                     </select>
                   </div>
                 )}

                 <div className="flex flex-col gap-1">
                   <label className="text-[10px] font-bold uppercase text-gray-500 px-1">Sana oralig'i</label>
                   <div className="flex items-center gap-2">
                      <input type="date" className="input h-9 text-xs w-[130px]" value={startDate} onChange={e => setStartDate(e.target.value)} />
                      <span className="text-gray-400">—</span>
                      <input type="date" className="input h-9 text-xs w-[130px]" value={endDate} onChange={e => setEndDate(e.target.value)} />
                   </div>
                 </div>
                 
                 <div className="flex items-end h-full pt-5">
                   {(status || startDate || endDate || customerId) && (
                     <button className="btn btn-ghost text-[11px] text-red-400 h-9 px-3" onClick={() => {
                        setStatus(''); setStartDate(''); setEndDate(''); setCustomerId('');
                     }}>Filtrlarni tozalash</button>
                   )}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          <>
            {/* Mobile overlay */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSelected(null)}
            />
            <motion.aside className="fixed inset-y-0 right-0 z-50 w-[85%] max-w-[340px] lg:relative lg:inset-auto lg:w-[320px] card flex flex-col shrink-0 overflow-y-auto"
              initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Buyurtma #{String(selected.id).padStart(4, '0')}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{selected.user_name}</p>
              </div>
              <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg" onClick={() => setSelected(null)}>{mounted && <X size={14} />}</button>
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

            {/* ── Order Stepper ── */}
            <div className="p-4 border-b bg-surface-lighter/30" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>Jarayon</p>
              
              <div className="px-2 mb-4">
                 <div className="relative flex justify-between items-center">
                    {/* Background Line */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-[2px] bg-white/5" />
                    
                    {/* Active Line (Static Fill) */}
                    <motion.div 
                      className="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: selected.status === 'PENDING' ? '0%' : 
                               selected.status === 'ACCEPTED' ? '33.33%' : 
                               selected.status === 'SHIPPED' ? '66.66%' : '100%' 
                      }}
                      transition={{ duration: 1, ease: "circOut" }}
                    />

                    {/* ── Active Flow Nur (Towards Next Step) ── */}
                    {selected.status !== 'DELIVERED' && (
                       <div className="absolute top-1/2 -translate-y-1/2 h-[2px] overflow-hidden"
                         style={{ 
                           left: selected.status === 'PENDING' ? '0%' : 
                                 selected.status === 'ACCEPTED' ? '33.33%' : '66.66%',
                           width: '33.33%'
                         }}>
                          <motion.div 
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                          />
                       </div>
                    )}

                    {[
                      { key: 'PENDING', icon: Clock, label: 'Kutilmoqda' },
                      { key: 'ACCEPTED', icon: CheckCircle2, label: 'Tasdiqlandi' },
                      { key: 'SHIPPED', icon: Truck, label: 'Yo\'lda' },
                      { key: 'DELIVERED', icon: Package, label: 'Yetkazildi' }
                    ].map((step, idx, arr) => {
                      const statuses = arr.map(s => s.key);
                      const currentIdx = statuses.indexOf(selected.status);
                      const isPast = idx < currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center">
                           <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 ${
                             isPast ? 'bg-indigo-500 text-white shadow-lg' : 
                             isCurrent ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20 scale-110 shadow-lg' : 
                             'bg-[#1e293b] text-gray-600 border border-white/5'
                           }`}>
                              <step.icon size={12} className={isCurrent ? 'animate-pulse' : ''} />
                           </div>
                           <p className={`absolute -bottom-6 whitespace-nowrap text-[8px] font-black uppercase tracking-tighter transition-colors duration-500 ${
                             isCurrent ? 'text-indigo-400' : isPast ? 'text-gray-400' : 'text-gray-600'
                           }`}>
                             {step.label}
                           </p>
                        </div>
                      );
                    })}
                 </div>
              </div>
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
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
