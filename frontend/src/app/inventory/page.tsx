'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, ArrowUpCircle, ArrowDownCircle, RefreshCw, 
  Filter, Calendar, Search, Package, User, Hash, Plus, X, Loader2, ChevronLeft, ChevronRight, ArrowUp
} from 'lucide-react';

interface Transaction {
  id: number;
  product_name: string;
  delta: number;
  transaction_type: string;
  order: number | null;
  created_at: string;
  created_by_name: string;
}

export default function InventoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [productId, setProductId] = useState('');
  
  // Restock Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (productId) params.append('product_id', productId);
      if (typeFilter) params.append('transaction_type', typeFilter);
      params.append('page', String(currentPage));

      const r = await api.get(`inventory-transactions/?${params.toString()}`);
      setTransactions(r.data.results || []);
      setTotalPages(Math.ceil((r.data.count || 0) / 12));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [productId, typeFilter, currentPage]);

  useEffect(() => {
    fetchTransactions();
    api.get('products/?page_size=1000').then(r => setProducts(r.data.results || [])).catch(console.error);
    
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [productId, typeFilter, currentPage]);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !amount || Number(amount) <= 0) return;
    
    setSaving(true);
    try {
      await api.post('inventory-transactions/', {
        product: Number(selectedProduct),
        delta: Number(amount),
        transaction_type: 'RESTOCK'
      });
      setIsModalOpen(false);
      setAmount('');
      setSelectedProduct('');
      fetchTransactions();
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const typeLabels: any = {
    SALE: { label: 'Sotuv', icon: ArrowDownCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
    RESTOCK: { label: 'Kirim', icon: ArrowUpCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    RETURN: { label: 'Qaytarish', icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    ADJUSTMENT: { label: 'Tuzatish', icon: Filter, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Ombor Arxivi</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Mahsulotlar astatkasi va harakatlar tarixi</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
             className={`btn h-11 px-4 gap-2 text-sm transition-all rounded-xl ${showFilters ? 'btn-primary' : 'bg-white/5 hover:bg-white/10'}`}
             onClick={() => setShowFilters(!showFilters)}
           >
             <Filter size={18} />
             <span className="hidden md:inline">{showFilters ? 'Yopish' : 'Filtrlar'}</span>
             {(productId || typeFilter) && <span className="w-2 h-2 rounded-full bg-red-400 ml-1 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center gap-2 px-4 h-11"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Kirim qilish</span>
          </button>
          <button onClick={fetchTransactions} className="btn btn-secondary p-2.5 h-11">
             <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="card p-4 md:p-6 bg-surface-lighter border-dashed flex flex-col sm:flex-row sm:items-end gap-4 md:gap-6">
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-1 tracking-widest">Mahsulot</label>
                  <select className="input h-10 text-xs w-full sm:w-[200px] bg-surface" value={productId} onChange={e => {setProductId(e.target.value); setCurrentPage(1);}}>
                     <option value="">Barcha mahsulotlar</option>
                     {products.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                     ))}
                  </select>
               </div>

               <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 px-1 tracking-widest">Tranzaksiya turi</label>
                  <select className="input h-10 text-xs w-full sm:w-[160px] bg-surface" value={typeFilter} onChange={e => {setTypeFilter(e.target.value); setCurrentPage(1);}}>
                     <option value="">Barcha turlar</option>
                     <option value="SALE">Sotuv</option>
                     <option value="RESTOCK">Kirim</option>
                     <option value="RETURN">Qaytarish</option>
                     <option value="ADJUSTMENT">Tuzatish</option>
                  </select>
               </div>

               <div className="relative w-full max-w-sm ml-auto">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input className="input pl-9 text-sm h-10 w-full" placeholder="Qidirish…" value={search} onChange={e => setSearch(e.target.value)} />
               </div>

               {(productId || typeFilter || search) && (
                 <button className="btn btn-ghost text-[11px] font-black text-red-400 h-10 px-4 hover:bg-red-500/10" onClick={() => {
                   setProductId(''); setTypeFilter(''); setSearch(''); setCurrentPage(1);
                 }}>
                   Tozalash
                 </button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th>Tur</th>
              <th>Mahsulot</th>
              <th>Miqdor (Δ)</th>
              <th>Sana</th>
              <th>Mas'ul</th>
              <th>Hujjat (ID)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(10).fill(0).map((_, i) => (
                <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j}><div className="skeleton h-4 rounded w-full" /></td>)}</tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <History size={48} className="mx-auto text-gray-600 opacity-20 mb-3" />
                  <p style={{ color: 'var(--text-muted)' }}>Harakatlar tarixi topilmadi</p>
                </td>
              </tr>
            ) : (
              transactions.map((t) => {
                const typeInfo = typeLabels[t.transaction_type] || { label: t.transaction_type, icon: History, color: 'text-gray-400', bg: 'bg-gray-400/10' };
                const Icon = typeInfo.icon;
                return (
                  <motion.tr 
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td>
                      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${typeInfo.bg} ${typeInfo.color}`}>
                        <Icon size={12} />
                        {typeInfo.label}
                      </div>
                    </td>
                    <td className="strong">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-gray-500" />
                        {t.product_name}
                      </div>
                    </td>
                    <td>
                      <span className={`font-mono font-bold ${t.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.delta > 0 ? `+${t.delta}` : t.delta}
                      </span>
                    </td>
                    <td className="text-[12px] text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} />
                        {new Date(t.created_at).toLocaleString('uz-UZ')}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-[12px]">
                        <User size={13} className="text-gray-500" />
                        {t.created_by_name}
                      </div>
                    </td>
                    <td>
                      {t.order ? (
                        <div className="flex items-center gap-2 font-mono text-[11px] text-indigo-400">
                          <Hash size={12} />
                          #{String(t.order).padStart(4, '0')}
                        </div>
                      ) : (
                        <span className="text-gray-600 text-[11px]">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Restock Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card w-full max-w-md p-6 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Yangi Kirim (Restock)</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg"><X size={20} /></button>
            </div>

            <form onSubmit={handleRestock} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-gray-500">Mahsulotni tanlang</label>
                <select 
                  className="input h-11"
                  required
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                >
                  <option value="">Tanlash...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Hozirgi astatka: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-gray-500">Miqdor (dona)</label>
                <input 
                  type="number"
                  className="input h-11"
                  placeholder="Masalan: 50"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary flex-1 py-3"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : 'Saqlash'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
