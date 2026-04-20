'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, LayoutGrid, List, Edit2, Trash2, X, SlidersHorizontal, AlertTriangle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  created_by_name?: string;
}

const EMPTY: Omit<Product, 'id'> = { name: '', description: '', price: '', stock: 0 };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    api.get('products/').then(r => setProducts(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-9" placeholder="Mahsulot qidirish…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center surface rounded-lg p-1">
            <button onClick={() => setView('table')} className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}><List size={15} /></button>
            <button onClick={() => setView('grid')} className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}><LayoutGrid size={15} /></button>
          </div>
          <button className="btn btn-primary gap-2" onClick={openAdd}><Plus size={14} /> Mahsulot qo'shish</button>
        </div>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <motion.div className="card overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <table className="table-base">
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
                : filtered.map((p, i) => (
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
                      <div className="flex items-center justify-end gap-1">
                        <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg text-blue-400" onClick={() => openEdit(p)}><Edit2 size={13} /></button>
                        <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg text-red-400" onClick={() => setDeleteConfirm(p.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              }
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Mahsulotlar topilmadi.</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
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
