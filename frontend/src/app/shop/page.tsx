'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Search, Plus, Minus, X, CheckCircle2, 
  ArrowRight, ShoppingCart, Loader2, Package, Tag, Clock, ChevronRight, SlidersHorizontal
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  created_by: number;
  created_by_name?: string;
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  items: OrderItem[];
  total_price: string;
  status: string;
  created_at: string;
}

export default function ShopPage() {
  const { role, userId } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [sellerId, setSellerId] = useState('');
  const [stockLt, setStockLt]   = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [users, setUsers]       = useState<any[]>([]);
  
  const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sellerId) params.append('seller_id', sellerId);
      if (stockLt)  params.append('stock_lt', stockLt);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);

      const [prodRes, orderRes] = await Promise.all([
        api.get(`products/?${params.toString()}`),
        api.get('orders/')
      ]);
      setProducts(prodRes.data);
      setOrders(orderRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [sellerId, stockLt, minPrice, maxPrice]);

  useEffect(() => {
    setMounted(true);
    fetchAll();
    api.get('users/').then(r => setUsers(r.data)).catch(() => {});
  }, [fetchAll]);

  const filtered = products.filter(p => {
    // O'zi yaratgan mahsulotlarni ko'rmasligi kerak
    if (userId && p.created_by === Number(userId)) return false;
    
    return p.name.toLowerCase().includes(search.toLowerCase()) ||
           p.description?.toLowerCase().includes(search.toLowerCase());
  });

  const getItemQuantity = (productId: number) => {
    return items.find(i => i.id === productId)?.quantity || 0;
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setOrderStatus('loading');
    
    try {
      const orderData = {
        items: items.map(i => ({
          product: i.id,
          quantity: i.quantity
        }))
      };
      
      await api.post('orders/', orderData);
      setOrderStatus('success');
      clearCart();
      setTimeout(() => {
        setOrderStatus('idle');
        setIsCartOpen(false);
        fetchAll(); // Refresh orders
      }, 2000);
    } catch (e) {
      setOrderStatus('error');
      setTimeout(() => setOrderStatus('idle'), 3000);
    }
  };

  const fmt = (val: string | number) => {
    return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 })
      .format(Number(val))
      .replace('UZS', "so'm");
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':   return 'badge-pending';
      case 'DELIVERED': return 'badge-delivered';
      case 'CANCELLED': return 'badge-cancelled';
      default:          return 'badge-active';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Do'kon</h1>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">Premium Buyumlar</p>
          </div>
          
          <nav className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
             <button 
               onClick={() => setShowOrders(false)}
               className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!showOrders ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-gray-300'}`}
             >
               Mahsulotlar
             </button>
             <button 
                onClick={() => setShowOrders(true)} 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${showOrders ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-gray-300'}`}
             >
               Buyurtmalarim
             </button>
          </nav>
        </div>

        <div className="flex items-center justify-between mb-4">
           <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                className="input pl-10 h-10" 
                placeholder="Mahsulot qidirish…" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
           </div>
           <button 
             className={`btn h-10 px-4 gap-2 text-sm transition-all ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
             onClick={() => setShowFilters(!showFilters)}
           >
             <SlidersHorizontal size={16} />
             {showFilters ? 'Filtrlarni yopish' : 'Filtrlar'}
             {(sellerId || stockLt || minPrice || maxPrice) && <span className="w-2 h-2 rounded-full bg-red-400 ml-1" />}
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
              <div className="card p-4 bg-surface-lighter border-dashed flex flex-wrap items-center gap-4">
                 <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500 px-1">Sotuvchi</label>
                    <select className="input h-9 text-xs w-[170px]" value={sellerId} onChange={e => setSellerId(e.target.value)}>
                       <option value="">Barcha sotuvchilar</option>
                       {users.filter(u => u.role !== 'CUSTOMER').map(u => (
                         <option key={u.id} value={u.id}>{u.username}</option>
                       ))}
                    </select>
                 </div>

                 <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500 px-1">Ombor</label>
                    <select className="input h-9 text-xs w-[150px]" value={stockLt} onChange={e => setStockLt(e.target.value)}>
                       <option value="">Barcha miqdorlar</option>
                       <option value="10">Kam qolgan ({"<"}10)</option>
                       <option value="5">Juda kam ({"<"}5)</option>
                       <option value="1">Tugagan (0)</option>
                    </select>
                 </div>

                 <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500 px-1">Narx oralig'i</label>
                    <div className="flex items-center gap-2">
                       <input type="number" className="input h-9 text-xs w-[90px]" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                       <span className="text-gray-400">—</span>
                       <input type="number" className="input h-9 text-xs w-[90px]" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                    </div>
                 </div>

                 <div className="flex items-end h-full pt-5">
                   {(sellerId || stockLt || minPrice || maxPrice) && (
                     <button className="btn btn-ghost text-[11px] text-red-400 h-9 px-3" onClick={() => {
                        setSellerId(''); setStockLt(''); setMinPrice(''); setMaxPrice('');
                     }}>Filtrlarni tozalash</button>
                   )}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="btn btn-primary relative px-4 py-2 flex items-center gap-2"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Savatcha</span>
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 brand-gradient rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-gray-900 border-glow animate-bounce">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="card p-4 space-y-4 skeleton-loader" />
            ))}
          </div>
        ) : showOrders ? (
          /* ── Orders History ── */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="text-indigo-400" size={20} />
                Mening buyurtmalarim
              </h2>
            </div>
            
            {orders.length === 0 ? (
              <div className="card p-20 text-center flex flex-col items-center">
                 <Package size={64} className="text-gray-600 opacity-10 mb-4" />
                 <p className="text-gray-500">Sizda hali buyurtmalar yo'q.</p>
                 <button onClick={() => setShowOrders(false)} className="mt-4 text-indigo-400 text-sm font-bold border-b border-indigo-400/30">Hozir xarid qiling</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order) => (
                  <motion.div 
                    key={order.id} 
                    className="card p-5 hover:border-indigo-400/30 transition-all cursor-pointer group"
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Buyurtma ID</p>
                        <h4 className="font-black text-lg">#{String(order.id).padStart(4, '0')}</h4>
                      </div>
                      <span className={`badge ${getStatusStyle(order.status)}`}>{order.status}</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                       {order.items.slice(0, 2).map((item) => (
                         <div key={item.id} className="flex justify-between text-[13px]">
                            <span className="text-gray-400">{item.product_name} x {item.quantity}</span>
                            <span className="font-bold">{fmt(Number(item.price) * item.quantity)}</span>
                         </div>
                       ))}
                       {order.items.length > 2 && (
                         <p className="text-[11px] text-indigo-400">va yana {order.items.length - 2} ta mahsulot…</p>
                       )}
                    </div>
                    
                    <div className="pt-4 border-t flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Jami</p>
                        <p className="font-black text-emerald-400">{fmt(order.total_price)}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-all group-hover:text-white">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={48} className="text-gray-600 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">Mahsulotlar topilmadi</h3>
          </div>
        ) : (
          /* ── Product List ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, idx) => {
              const q = getItemQuantity(product.id);
              return (
                <motion.div 
                  key={product.id}
                  className="card group overflow-hidden flex flex-col cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="aspect-square brand-gradient relative transition-transform group-hover:scale-105 duration-500 flex items-center justify-center opacity-80 group-hover:opacity-100">
                    <ShoppingBag size={64} className="text-white/20" />
                    <div className="absolute top-3 left-3">
                      <span className={`badge ${product.stock > 0 ? 'badge-delivered' : 'badge-cancelled'} text-[10px]`}>
                        {product.stock > 0 ? `${product.stock} dona mavjud` : 'Tugagan'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-1 flex items-center justify-between gap-2 text-[15px]">
                      <h3 className="font-bold group-hover:text-indigo-400 transition-colors line-clamp-1">{product.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="w-4 h-4 rounded-full brand-gradient flex items-center justify-center text-[7px] text-white font-bold">
                        {(product.created_by_name || 'A')[0].toUpperCase()}
                      </div>
                      <span className="text-[11px] font-medium text-gray-500">
                        {product.created_by_name || 'Admin'}
                      </span>
                    </div>

                    <p className="text-[12px] line-clamp-2 mb-5 flex-1 text-gray-500">
                      {product.description || "Ushbu mahsulot haqida ma'lumot yo'q."}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Narxi</p>
                        <p className="font-black text-lg bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                          {fmt(product.price)}
                        </p>
                      </div>
                      
                      {q > 0 ? (
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-3">
                          <button 
                            onClick={() => updateQuantity(product.id, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-gray-400"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-black text-sm w-4 text-center">{q}</span>
                          <button 
                            onClick={() => updateQuantity(product.id, 1)}
                            disabled={q >= product.stock}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-indigo-400 disabled:opacity-30"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addItem({ ...product, price: Number(product.price), quantity: 1 })}
                          disabled={product.stock <= 0}
                          className={`btn w-10 h-10 p-0 rounded-xl flex items-center justify-center transition-all ${product.stock > 0 ? 'btn-primary shadow-lg shadow-indigo-500/20 active:scale-95' : 'opacity-30 cursor-not-allowed'}`}
                        >
                          <Plus size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer Overlay (Same as before but with minor UI polish) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
            />
            <motion.aside 
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 glass border-l flex flex-col shadow-2xl"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            >
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 brand-gradient rounded-xl text-white"><ShoppingCart size={20} /></div>
                  <h2 className="font-bold text-lg">Savatcha</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="btn btn-ghost w-10 h-10 p-0 rounded-xl"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                     <ShoppingCart size={32} className="text-gray-600 opacity-20 mb-4" />
                     <p className="text-sm font-medium text-gray-500">Savatchangiz bo'sh</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="w-16 h-16 rounded-xl brand-gradient flex-shrink-0 flex items-center justify-center text-white/30 font-black">
                        {item.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-[14px] truncate">{item.name}</h4>
                          <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-400"><X size={14} /></button>
                        </div>
                        <p className="text-[13px] font-bold text-indigo-400 mb-3">{fmt(item.price)}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-black/20 rounded-lg p-0.5">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded text-gray-400"><Minus size={12} /></button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded text-gray-400"><Plus size={12} /></button>
                          </div>
                          <p className="text-[12px] font-black ml-auto">{fmt(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 glass border-t space-y-4" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex justify-between text-lg font-black">
                    <span>Jami:</span>
                    <span className="text-emerald-400">{fmt(total)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={orderStatus !== 'idle'}
                    className="btn btn-primary w-full py-4 font-bold relative overflow-hidden"
                  >
                    {orderStatus === 'loading' ? <Loader2 className="animate-spin" size={18} /> : 'Buyurtma berish'}
                    {orderStatus === 'success' && (
                      <motion.div className="absolute inset-0 bg-emerald-500 flex items-center justify-center" initial={{ y: '100' }} animate={{ y: 0 }}>
                        Muvaffaqiyatli! 🎉
                      </motion.div>
                    )}
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-2xl overflow-hidden flex flex-col md:flex-row gap-0"
            >
              <div className="w-full md:w-1/2 aspect-square brand-gradient flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                 <ShoppingBag size={140} className="text-white/20 relative z-10 animate-pulse-slow" />
                 <button 
                   onClick={() => setSelectedProduct(null)} 
                   className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white md:hidden z-20 hover:bg-black/60 transition-colors"
                 >
                   <X size={20} />
                 </button>
              </div>
              
              <div className="w-full md:w-1/2 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black mb-2">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-2">
                       <span className={`badge ${selectedProduct.stock > 0 ? 'badge-delivered' : 'badge-cancelled'}`}>
                         {selectedProduct.stock > 0 ? 'Sotuvda mavjud' : 'Tugagan'}
                       </span>
                       <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                         {selectedProduct.stock} dona
                       </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="hidden md:flex btn btn-ghost w-10 h-10 p-0 rounded-xl"><X size={20} /></button>
                </div>

                <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-white/5 border border-white/5">
                   <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold">
                     {(selectedProduct.created_by_name || 'A')[0]}
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sotuvchi</p>
                     <p className="text-sm font-bold">{selectedProduct.created_by_name || 'Admin'}</p>
                   </div>
                </div>

                <p className="text-gray-400 text-[15px] leading-relaxed mb-8 flex-1">
                  {selectedProduct.description || "Ushbu premium mahsulot haqida qo'shimcha ma'mulotlar yaqin orada taqdim etiladi. Sifat va ishonch kafolatlangan."}
                </p>

                <div className="space-y-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                   <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Narxi</p>
                        <p className="text-3xl font-black text-emerald-400">{fmt(selectedProduct.price)}</p>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem({ ...selectedProduct, price: Number(selectedProduct.price), quantity: 1 });
                          setSelectedProduct(null);
                          setIsCartOpen(true);
                        }}
                        disabled={selectedProduct.stock <= 0}
                        className="btn btn-primary px-8 py-4 flex items-center gap-2 shadow-xl shadow-indigo-500/20"
                      >
                        <Plus size={18} />
                        Savatga qo'shish
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
