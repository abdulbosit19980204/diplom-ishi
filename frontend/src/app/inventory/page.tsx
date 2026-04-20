'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'yramer-motion';
import { 
  History, ArrowUpCircle, ArrowDownCircle, RefreshCw, 
  Filter, Calendar, Search, Package, User, Hash
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

  const fetchTransactions = () => {
    setLoading(true);
    api.get('inventory-transactions/')
      .then(r => setTransactions(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactions.filter(t => {
    const matchesSearch = t.product_name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? t.transaction_type === typeFilter : true;
    return matchesSearch && matchesType;
  });

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
        
        <div className="flex items-center gap-3">
          <button onClick={fetchTransactions} className="btn btn-secondary p-2.5 rounded-xl">
             <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            className="input pl-10 h-11" 
            placeholder="Mahsulot nomi bo'yicha qidirish..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <select 
          className="input h-11"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">Barcha turdagi harakatlar</option>
          <option value="SALE">Sotuvlar</option>
          <option value="RESTOCK">Kirimlar (Restock)</option>
          <option value="RETURN">Qaytarilganlar</option>
          <option value="ADJUSTMENT">Tuzatishlar</option>
        </select>
      </div>

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
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <History size={48} className="mx-auto text-gray-600 opacity-20 mb-3" />
                  <p style={{ color: 'var(--text-muted)' }}>Harakatlar tarixi topilmadi</p>
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
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
    </div>
  );
}
