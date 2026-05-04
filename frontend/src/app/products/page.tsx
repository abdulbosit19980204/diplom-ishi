'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, List, Grid, Edit2, Trash2, X, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowUp, AlertTriangle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  created_by?: number;
  created_by_name?: string;
}

const EMPTY: Omit<Product, 'id'> = { name: '', description: '', price: '', stock: 0 };

export default function ProductsPage() {
  const { userId, role, isSuperuser } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [sellerId, setSellerId] = useState('');
  const [stockLt, setStockLt] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  // Modal state
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sellerId) params.append('seller_id', sellerId);
      if (stockLt) params.append('stock_lt', stockLt);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      params.append('page', String(currentPage));

      const r = await api.get(`products/?my_products=true&${params.toString()}`);
      setProducts(r.data.results || []);
      setTotalPages(Math.ceil((r.data.count || 0) / 12));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [sellerId, stockLt, minPrice, maxPrice, currentPage]);

  useEffect(() => { 
    setMounted(true);
    fetchProducts(); 
    if (isSuperuser || role === 'ADMIN') {
      api.get('users/').then(r => setUsers(r.data)).catch(() => {});
    }
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mounted) {
      setCurrentPage(1);
      fetchProducts();
    }
  }, [sellerId, stockLt, minPrice, maxPrice]);

  useEffect(() => {
    if (mounted) fetchProducts();
  }, [currentPage]);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setError(''); setModal('add'); };
  const openEdit = (p: Product) => { setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock }); setEditId(p.id); setError(''); setModal('edit'); };

  const saveProduct = async () => {
    if (!form.name || !form.price) { setError("Nomi va narx majburiy"); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'add') {
        await api.post('products/', form);
      } else {
        await api.put(`products/${editId}/`, form);
      }
      fetchProducts();
      setModal(null);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: number) => {
    await api.delete(`products/${id}/`);
    fetchProducts();
    setDeleteConfirm(null);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="input pl-9 text-sm h-10 w-full" placeholder="Mahsulot nomi…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button 
             className={`btn h-10 px-4 gap-2 text-sm transition-all rounded-xl ${showFilters ? 'btn-primary' : 'bg-white/5 hover:bg-white/10'}`}
             onClick={() => setShowFilters(!showFilters)}
           >
             <SlidersHorizontal size={16} />
             <span className="hidden md:inline">{showFilters ? 'Yopish' : 'Filtrlar'}</span>
             {(sellerId || stockLt || minPrice || maxPrice) && <span className="w-2 h-2 rounded-full bg-red-400 ml-1 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
           </button>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button className={`p-2 rounded-lg transition-all ${view === 'table' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:text-white'}`} onClick={() => setView('table')}><List size={16} /></button>
            <button className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:text-white'}`} onClick={() => setView('grid')}><Grid size={16} /></button>
          </div>
          <button className="btn btn-primary h-10 px-4 gap-2 text-sm rounded-xl font-bold active:scale-95 transition-all" onClick={openAdd}>
            <Plus size={16} />
            <span className="hidden sm:inline">Mahsulot qo'shish</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="card p-4 md:p-6 bg-surface-lighter border-dashed flex flex-col sm:flex-row sm:items-end gap-4 md:gap-6">
               {(isSuperuser || role === 'ADMIN') && (
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 px-1 tracking-widest">Sotuvchi</label>
                    <select className="input h-10 text-xs w-full sm:w-[180px] bg-surface" value={sellerId} onChange={e => setSellerId(e.target.value)}>
                       <option value="">Barcha sotuvchilar</option>
                       {users.filter(u => u.role !== 'CUSTOMER').map(u => (
                         <option key={u.id} value={u.id}>{u.username}</option>
                       ))}
                    </select>
                 </div>
               )}

               <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-1 tracking-widest">Ombor qoldig'i</label>
                  <select className="input h-10 text-xs w-full sm:w-[160px] bg-surface" value={stockLt} onChange={e => setStockLt(e.target.value)}>
                     <option value="">Barcha miqdorlar</option>
                     <option value="10">Kam qolgan ({"<"}10)</option>
                     <option value="5">Juda kam ({"<"}5)</option>
                     <option value="1">Tugagan (0)</option>
                  </select>
               </div>

               <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-1 tracking-widest">Narx oralig'i (so'm)</label>
                  <div className="flex items-center gap-2">
                     <input type="number" className="input h-10 text-xs w-full sm:w-[110px] bg-surface" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                     <span className="text-gray-600 font-bold">—</span>
                     <input type="number" className="input h-10 text-xs w-full sm:w-[110px] bg-surface" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                  </div>
               </div>

               <div className="sm:ml-auto">
                 {(sellerId || stockLt || minPrice || maxPrice) && (
                   <button className="btn btn-ghost text-[11px] font-black text-red-400 h-10 px-4 hover:bg-red-500/10" onClick={() => {
                     setSellerId(''); setStockLt(''); setMinPrice(''); setMaxPrice('');
                   }}>
                     Tozalash
                   </button>
                 )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>      {/* Table view */}
      {view === 'table' && (
        <motion.div className="card overflow-x-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <table className="table-base w-full min-w-[700px]">
            <thead>
              <tr>
                <th>Mahsulot nomi</th>
                <th>Sotuvchi</th>
                <th>Narxi</th>
                <th>Omborda</th>
                <th>Holati</th>
                <th className="text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>
                ))
                : products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-indigo-400 text-sm"
                          style={{ background: 'rgba(99,102,241,0.1)' }}>
                          {p.name[0]}
                        </div>
                        <div>
                          <p className="strong text-[13px]">{p.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.description?.slice(0, 40) || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                       <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full brand-gradient flex items-center justify-center text-[8px] text-white font-bold">
                          {(p.created_by_name || 'A')[0].toUpperCase()}
                        </div>
                        <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                           {p.created_by_name || 'Admin'}
                        </span>
                      </div>
                    </td>
                    <td className="strong">${p.price}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full" style={{ background: 'var(--bg-overlay)' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${Math.min(p.stock, 100)}%`,
                            background: p.stock > 10 ? 'var(--success)' : p.stock > 0 ? 'var(--warning)' : 'var(--danger)'
                          }} />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.stock}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.stock > 10 ? 'badge-delivered' : p.stock > 0 ? 'badge-pending' : 'badge-cancelled'}`}>
                        {p.stock > 10 ? 'Mavjud' : p.stock > 0 ? 'Kamaymoqda' : 'Tugagan'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        {(isSuperuser || role === 'ADMIN' || String(p.created_by) === String(userId)) ? (
                          <>
                            <button className="btn btn-ghost w-10 h-10 p-0 rounded-xl text-blue-400 hover:bg-blue-500/10" 
                              onClick={() => openEdit(p)}
                              title="Tahrirlash">
                              <Edit2 size={16} />
                            </button>
                            <button className="btn btn-ghost w-10 h-10 p-0 rounded-xl text-red-400 hover:bg-red-500/10" 
                              onClick={() => setDeleteConfirm(p.id)}
                              title="O'chirish">
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[12px] italic text-gray-500 px-4">Faqat o'z mahsulotingizni tahrirlay olasiz</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              }
              {!loading && products.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Mahsulotlar topilmadi.</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p, i) => (
            <motion.div key={p.id} className="card p-4 group cursor-pointer"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
              <div className="w-full h-28 rounded-lg mb-4 flex items-center justify-center text-3xl font-bold text-indigo-400"
                style={{ background: 'var(--bg-overlay)' }}>
                {p.name[0]}
              </div>
              <p className="font-semibold text-[14px] strong">{p.name}</p>
              <p className="text-[13px] mt-1 font-bold text-indigo-400">${p.price}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className={`badge ${p.stock > 0 ? 'badge-active' : 'badge-cancelled'}`}>
                  {p.stock > 0 ? `${p.stock} ta bor` : 'Tugagan'}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="btn btn-ghost w-7 h-7 p-0 rounded-md text-blue-400" onClick={() => openEdit(p)}><Edit2 size={12} /></button>
                  <button className="btn btn-ghost w-7 h-7 p-0 rounded-md text-red-400" onClick={() => setDeleteConfirm(p.id)}><Trash2 size={12} /></button>
                </div>
              </div>
            </motion.div>
          ))}
          {/* Add card */}
          <motion.div onClick={openAdd}
            className="card p-4 flex flex-col items-center justify-center cursor-pointer group border-dashed"
            style={{ minHeight: '200px', borderStyle: 'dashed', borderColor: 'rgba(99,102,241,0.3)' }}
            whileHover={{ borderColor: 'rgba(99,102,241,0.6)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors"
              style={{ background: 'rgba(99,102,241,0.1)' }}>
              <Plus size={20} className="text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-indigo-400">Yangi mahsulot</p>
          </motion.div>
        </div>
      )}

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 mb-4">
          <button disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn btn-secondary p-2 disabled:opacity-30"><ChevronLeft size={20} /></button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1 ? 'btn-primary' : 'bg-surface-lighter hover:bg-white/10'}`}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn btn-secondary p-2 disabled:opacity-30"><ChevronRight size={20} /></button>
        </div>
      )}

      {/* Scroll Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-10 right-10 w-12 h-12 rounded-2xl bg-indigo-500 text-white shadow-xl flex items-center justify-center z-[100] hover:bg-indigo-400"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setModal(null)} />
            <motion.div
              className="relative w-full max-w-md card p-6 z-10"
              initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {modal === 'add' ? "Yangi mahsulot qo'shish" : "Mahsulotni tahrirlash"}
                </h2>
                <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg" onClick={() => setModal(null)}><X size={15} /></button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg mb-4"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
                  <p className="text-[13px]" style={{ color: 'var(--danger)' }}>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Nomi *
                  </label>
                  <input className="input" placeholder="Mahsulot nomi" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Tavsif
                  </label>
                  <textarea className="input resize-none" rows={3} placeholder="Mahsulot haqida qisqacha…"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Narxi ($) *
                    </label>
                    <input className="input" type="number" min="0" placeholder="0.00" value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Ombor (dona)
                    </label>
                    <input className="input" type="number" min="0" placeholder="0" value={form.stock}
                      onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="btn btn-secondary flex-1" onClick={() => setModal(null)}>Bekor qilish</button>
                <button className="btn btn-primary flex-1" onClick={saveProduct} disabled={saving}>
                  {saving ? 'Saqlanmoqda…' : modal === 'add' ? "Qo'shish" : 'Saqlash'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setDeleteConfirm(null)} />
            <motion.div className="relative w-full max-w-sm card p-6 z-10 text-center"
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(239,68,68,0.1)' }}>
                <Trash2 size={20} style={{ color: 'var(--danger)' }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Mahsulotni o'chirish?</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Bu amalni qaytarib bo'lmaydi.</p>
              <div className="flex gap-3">
                <button className="btn btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>Bekor</button>
                <button className="btn flex-1" style={{ background: 'var(--danger)', color: '#fff' }}
                  onClick={() => deleteProduct(deleteConfirm)}>O'chirish</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
