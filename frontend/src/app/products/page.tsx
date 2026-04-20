'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Plus, Search, LayoutGrid, List, SlidersHorizontal, Edit2, Trash2, MoreHorizontal } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts]   = useState<any[]>([]);
  const [view, setView]           = useState<'table'|'grid'>('table');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('products/')
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }} />
          <input
            className="input pl-9"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* View toggle */}
          <div className="flex items-center surface rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setView('table')}
              className={`p-1.5 rounded-md transition-colors ${view==='table' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
            ><List size={15} /></button>
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-colors ${view==='grid'  ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
            ><LayoutGrid size={15} /></button>
          </div>

          <button className="btn btn-secondary gap-2">
            <SlidersHorizontal size={14} /> Filters
          </button>
          <button className="btn btn-primary gap-2">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      {view === 'table' && (
        <motion.div className="card overflow-hidden" initial={{ opacity:0 }} animate={{ opacity:1 }}>
          <table className="table-base">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Stock</th>
                <th>Price</th><th>Status</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_,i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_,j) => (
                      <td key={j}><div className="skeleton h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
                : filtered.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex-shrink-0" style={{ background:'var(--bg-overlay)' }} />
                        <span className="strong">{p.name}</span>
                      </div>
                    </td>
                    <td style={{ color:'var(--text-muted)' }}>{p.category ?? 'General'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full" style={{ background:'var(--bg-overlay)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width:`${Math.min((p.stock/100)*100, 100)}%`, background: p.stock > 20 ? 'var(--success)' : 'var(--danger)' }}
                          />
                        </div>
                        <span style={{ fontSize:'12px', color:'var(--text-muted)' }}>{p.stock}</span>
                      </div>
                    </td>
                    <td className="strong">${p.price}</td>
                    <td>
                      <span className={`badge ${p.stock > 0 ? 'badge-active' : 'badge-cancelled'}`}>
                        {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg"><Edit2 size={13} /></button>
                        <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg text-red-500"><Trash2 size={13} /></button>
                        <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg"><MoreHorizontal size={13} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              }
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12" style={{ color:'var(--text-muted)' }}>No products found.</td></tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Grid */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <motion.div key={p.id} className="card p-4 group cursor-pointer"
              initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.04 }}>
              <div className="w-full h-32 rounded-lg mb-4" style={{ background:'var(--bg-overlay)' }} />
              <p className="font-medium text-[14px] strong">{p.name}</p>
              <p className="text-[13px] mt-1 font-semibold text-indigo-400">${p.price}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor:'var(--border)' }}>
                <span className={`badge ${p.stock > 0 ? 'badge-active' : 'badge-cancelled'}`}>
                  {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                </span>
                <button className="btn btn-ghost w-7 h-7 p-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
