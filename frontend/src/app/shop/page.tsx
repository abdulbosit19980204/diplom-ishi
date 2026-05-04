'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Search, SlidersHorizontal, Package, Loader2, ArrowRight, X, Minus, Plus, Trash2,
  Clock, Truck, CheckCircle2, MessageSquare, ChevronLeft, ChevronRight, ArrowUp, ShoppingCart, Tag, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

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
  seller_id: number;
  seller_name: string;
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore();

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sellerId) params.append('seller_id', sellerId);
      if (stockLt)  params.append('stock_lt', stockLt);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      
      let pUrl = `products/?page=${currentPage}&${params.toString()}`;
      let oUrl = `orders/?page=${currentPage}`;

      const [prodRes, orderRes] = await Promise.all([
        api.get(pUrl),
        api.get(oUrl)
      ]);
      
      setProducts(prodRes.data.results || []);
      setTotalPages(Math.ceil((prodRes.data.count || 0) / 12));
      
      const sortedOrders = (orderRes.data.results || []).sort((a: any, b: any) => b.id - a.id);
      setOrders(sortedOrders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [sellerId, stockLt, minPrice, maxPrice, currentPage]);

  useEffect(() => {
    setMounted(true);
    fetchAll();
    if (role === 'ADMIN' || role === 'MANAGER') {
       api.get('users/').then(r => setUsers(r.data)).catch(() => {});
    }
    
    window.addEventListener('refresh-orders', fetchAll);
    
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('refresh-orders', fetchAll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [fetchAll, role]);

  const filtered = products.filter(p => {
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
        fetchAll();
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

  if (!mounted) return <div className="p-10 text-center opacity-50">Yuklanmoqda...</div>;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="p-6 md:p-10 flex-1 flex flex-col">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
             <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                  Marketplace
                </h1>
                <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                  <button 
                    onClick={() => setShowOrders(false)}
                    className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] uppercase font-black tracking-widest transition-all ${!showOrders ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Do'kon
                  </button>
                  <button 
                    onClick={() => setShowOrders(true)} 
                    className={`px-3 md:px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] uppercase font-black tracking-widest transition-all ${showOrders ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Buyurtmalarim
                  </button>
                </nav>
             </div>
             <p className="text-gray-500 text-sm font-medium">Siz uchun saralangan premium mahsulotlar</p>
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="btn btn-primary relative w-full md:w-auto px-6 h-12 md:h-14 flex items-center justify-center gap-3 rounded-2xl shadow-[0_10px_30px_rgba(99,102,241,0.3)] active:scale-95 transition-all"
          >
            <ShoppingBag size={20} />
            <span className="font-bold">Savatcha</span>
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[11px] font-black w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full border-4 border-[#0f172a] shadow-lg">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {!showOrders && (
          <>
            {/* ── Filters ── */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    className="input pl-12 h-11 text-sm w-full bg-surface-lighter border-none shadow-inner" 
                    placeholder="Mahsulotlarni qidirish..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                
                <button 
                  className={`btn h-11 px-5 gap-3 text-sm font-bold transition-all rounded-xl w-full md:w-auto justify-center ${showFilters ? 'btn-primary' : 'bg-surface-lighter hover:bg-white/10'}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal size={18} />
                  <span>Filtrlar</span>
                  {(sellerId || stockLt || minPrice || maxPrice) && <span className="w-2 h-2 rounded-full bg-red-400 ml-1 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                </button>
             </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-8"
                >
                  <div className="card p-4 md:p-6 bg-surface-lighter border-dashed flex flex-col sm:flex-row sm:items-end gap-4 md:gap-6">
                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 px-1 tracking-widest">Sotuvchi</label>
                        <select className="input h-10 text-xs w-[180px] bg-surface" value={sellerId} onChange={e => setSellerId(e.target.value)}>
                           <option value="">Barcha sotuvchilar</option>
                           {users.filter(u => u.role !== 'CUSTOMER').map(u => (
                             <option key={u.id} value={u.id}>{u.username}</option>
                           ))}
                        </select>
                     </div>

                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 px-1 tracking-widest">Ombor qoldig'i</label>
                        <select className="input h-10 text-xs w-[160px] bg-surface" value={stockLt} onChange={e => setStockLt(e.target.value)}>
                           <option value="">Barcha miqdorlar</option>
                           <option value="10">Kam qolgan ({"<"}10)</option>
                           <option value="5">Juda kam ({"<"}5)</option>
                           <option value="1">Tugagan (0)</option>
                        </select>
                     </div>

                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 px-1 tracking-widest">Narx oralig'i (so'm)</label>
                        <div className="flex items-center gap-2">
                           <input type="number" className="input h-10 text-xs w-[110px] bg-surface" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                           <span className="text-gray-600 font-bold">—</span>
                           <input type="number" className="input h-10 text-xs w-[110px] bg-surface" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                        </div>
                     </div>

                     <div className="ml-auto">
                       {(sellerId || stockLt || minPrice || maxPrice) && (
                         <button className="btn btn-ghost text-[11px] font-black text-red-400 h-10 px-4 hover:bg-red-500/10" onClick={() => {
                            setSellerId(''); setStockLt(''); setMinPrice(''); setMaxPrice('');
                         }}>TOZALASH</button>
                       )}
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-32">
             <Loader2 size={48} className="animate-spin text-indigo-500 opacity-20" />
             <p className="text-sm font-black text-gray-600 tracking-widest animate-pulse uppercase">Yuklanmoqda...</p>
          </div>
        ) : showOrders ? (
          /* ── Orders History ── */
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="card p-32 text-center flex flex-col items-center opacity-40 border-dashed">
                 <Package size={80} className="mb-4" />
                 <p className="text-lg font-black uppercase tracking-tighter">Buyurtmalar mavjud emas</p>
                 <button onClick={() => setShowOrders(false)} className="mt-6 btn btn-primary px-8">Hozir xarid qilish</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {orders.map((order) => (
                  <motion.div 
                    key={order.id} 
                    className="card p-6 hover:shadow-2xl transition-all cursor-pointer group border-white/5"
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Buyurtma</p>
                        <h4 className="font-black text-2xl tracking-tighter">#{String(order.id).padStart(4, '0')}</h4>
                      </div>
                      <span className={`badge ${getStatusStyle(order.status)} font-black text-[10px]`}>
                        {order.status === 'PENDING' ? 'Kutilmoqda' : order.status === 'ACCEPTED' ? 'Tasdiqlandi' : order.status === 'SHIPPED' ? 'Yo\'lda' : 'Yetkazildi'}
                      </span>
                    </div>

                    {/* ── Order Stepper ── */}
                    <div className="mb-8 mt-2">
                       <div className="relative flex justify-between">
                          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-[2px] bg-white/5" />
                          <motion.div 
                            className="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ 
                              width: order.status === 'PENDING' ? '0%' : 
                                     order.status === 'ACCEPTED' ? '33.33%' : 
                                     order.status === 'SHIPPED' ? '66.66%' : '100%' 
                            }}
                            transition={{ duration: 1, ease: "circOut" }}
                          />
                          {order.status !== 'DELIVERED' && (
                             <div className="absolute top-1/2 -translate-y-1/2 h-[2px] overflow-hidden"
                               style={{ 
                                 left: order.status === 'PENDING' ? '0%' : 
                                       order.status === 'ACCEPTED' ? '33.33%' : '66.66%',
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
                            const currentIdx = statuses.indexOf(order.status);
                            const isPast = idx < currentIdx;
                            const isCurrent = idx === currentIdx;

                            return (
                              <div key={step.key} className="relative z-10 flex flex-col items-center">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                                   isPast ? 'bg-indigo-500 text-white' : 
                                   isCurrent ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20 scale-110 shadow-lg' : 
                                   'bg-[#1e293b] text-gray-600 border border-white/5'
                                 }`}>
                                    <step.icon size={14} className={isCurrent ? 'animate-pulse' : ''} />
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
                    
                    <div className="space-y-3 mb-6">
                       {order.items.slice(0, 3).map((item) => (
                         <div key={item.id} className="flex justify-between text-[13px] font-medium">
                            <span className="text-gray-400 truncate mr-4">{item.product_name} <span className="text-[10px] font-black text-gray-600">x{item.quantity}</span></span>
                            <span className="font-bold flex-shrink-0">{fmt(Number(item.price) * item.quantity)}</span>
                         </div>
                       ))}
                       {order.items.length > 3 && (
                         <p className="text-[11px] text-indigo-400 font-black tracking-widest uppercase">+ {order.items.length - 3} ta mahsulot</p>
                       )}
                    </div>
                    
                    <div className="pt-6 border-t border-white/5 space-y-4">
                       <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Jami summa</p>
                            <p className="font-black text-2xl text-emerald-400 tracking-tighter">{fmt(order.total_price)}</p>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-all group-hover:text-white shadow-lg">
                            <ChevronRight size={20} />
                          </div>
                       </div>

                       <Link 
                         href={`/chat?orderId=${order.id}&userId=${order.seller_id}&name=${order.seller_name}`}
                         onClick={(e) => e.stopPropagation()}
                         className="btn btn-secondary w-full py-3 text-[12px] flex items-center justify-center gap-2 group/btn"
                       >
                         <MessageSquare size={16} className="group-hover/btn:rotate-12 transition-transform" />
                         <span>Sotuvchi bilan bog'lanish</span>
                       </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-32 card bg-surface-lighter border-dashed opacity-40">
             <ShoppingBag size={80} className="mb-4" />
             <p className="text-xl font-black uppercase tracking-tighter">Mahsulotlar topilmadi</p>
             <button onClick={() => {setSearch(''); setSellerId('');}} className="btn btn-ghost text-[10px] font-black uppercase tracking-widest">Tozalash</button>
          </div>
        ) : (
          /* ── Product List ── */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, idx) => {
                const q = getItemQuantity(product.id);
                return (
                  <motion.div 
                    key={product.id}
                    className="card group overflow-hidden flex flex-col cursor-pointer hover:shadow-2xl transition-all border-white/5"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="aspect-square brand-gradient relative transition-transform group-hover:scale-105 duration-700 flex items-center justify-center opacity-90 group-hover:opacity-100 overflow-hidden">
                      <ShoppingBag size={80} className="text-white/20 drop-shadow-2xl" />
                      <div className="absolute top-4 left-4">
                        <span className={`badge ${product.stock > 0 ? 'badge-delivered' : 'badge-cancelled'} text-[10px] font-black shadow-lg`}>
                          {product.stock > 0 ? `${product.stock} dona mavjud` : 'Tugagan'}
                        </span>
                      </div>
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute bottom-4 right-4 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-md animate-pulse shadow-lg">
                          SHOSHILING!
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-black text-xl mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1 tracking-tight" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-lg brand-gradient flex items-center justify-center text-[10px] text-white font-black shadow-md">
                          {(product.created_by_name || 'A')[0].toUpperCase()}
                        </div>
                        <span className="text-[12px] font-bold text-gray-500">{product.created_by_name || 'Admin'}</span>
                      </div>
                      <p className="text-[13px] line-clamp-2 mb-6 flex-1 text-gray-500 leading-relaxed italic font-medium">"{product.description || "Premium sifatdagi tanlov."}"</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Narxi</p>
                          <p className="font-black text-xl text-green-400 tracking-tighter">{fmt(product.price)}</p>
                        </div>
                        {q > 0 ? (
                          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-4 shadow-inner" onClick={e => e.stopPropagation()}>
                            <button onClick={() => updateQuantity(product.id, -1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-gray-400"><Minus size={16} /></button>
                            <span className="font-black text-base w-4 text-center">{q}</span>
                            <button onClick={() => updateQuantity(product.id, 1)} disabled={q >= product.stock} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-indigo-400 disabled:opacity-30"><Plus size={16} /></button>
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); addItem({ ...product, price: Number(product.price), quantity: 1 }); }}
                            disabled={product.stock <= 0}
                            className={`btn w-12 h-12 p-0 rounded-2xl flex items-center justify-center transition-all ${product.stock > 0 ? 'btn-primary shadow-xl shadow-indigo-500/30 active:scale-90 hover:rotate-3' : 'opacity-20 cursor-not-allowed grayscale'}`}
                          >
                            <Plus size={24} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="btn btn-secondary p-2 disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1 ? 'btn-primary' : 'bg-surface-lighter hover:bg-white/10'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="btn btn-secondary p-2 disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Cart Drawer ── */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
            />
            <motion.aside 
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[70] bg-surface border-l flex flex-col shadow-2xl"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-8 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-4">
                  <div className="p-4 brand-gradient rounded-2xl text-white shadow-xl rotate-3"><ShoppingCart size={28} /></div>
                  <div>
                    <h2 className="font-black text-3xl tracking-tighter">Savatcha</h2>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{items.length} TA MAHSULOT</p>
                  </div>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="btn btn-ghost w-14 h-14 p-0 rounded-2xl hover:rotate-90 transition-all"><X size={28} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-20">
                     <ShoppingCart size={100} className="mb-6 stroke-[1px]" />
                     <p className="text-xl font-black uppercase tracking-[0.3em]">Savatchangiz bo'sh</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-5 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="w-20 h-20 rounded-2xl brand-gradient flex-shrink-0 flex items-center justify-center text-white/40 font-black text-2xl shadow-lg group-hover:scale-105 transition-transform">
                        {item.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-black text-lg truncate tracking-tight">{item.name}</h4>
                          <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1"><X size={18} /></button>
                        </div>
                        <p className="text-sm font-black text-indigo-400 mb-4 tracking-tighter">{fmt(item.price)}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center bg-black/40 rounded-2xl p-1 shadow-inner">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"><Minus size={14} /></button>
                            <span className="w-12 text-center text-base font-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"><Plus size={14} /></button>
                          </div>
                          <p className="text-lg font-black text-green-400 tracking-tighter">{fmt(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-10 bg-surface-lighter border-t space-y-8" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-gray-500 font-black uppercase text-[11px] tracking-widest mb-1">Jami to'lov</p>
                      <p className="text-4xl font-black text-green-400 tracking-tighter leading-none">{fmt(total)}</p>
                    </div>
                    <Tag className="text-indigo-500 opacity-20" size={40} />
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={orderStatus !== 'idle'}
                    className="btn btn-primary w-full h-18 text-xl font-black relative overflow-hidden shadow-[0_20px_50px_rgba(99,102,241,0.4)] rounded-3xl active:scale-95 transition-all group"
                  >
                    {orderStatus === 'loading' ? <Loader2 className="animate-spin" size={28} /> : 'BUYURTMA BERISH'}
                    {orderStatus === 'success' && (
                      <motion.div className="absolute inset-0 bg-emerald-500 flex items-center justify-center" initial={{ y: '100%' }} animate={{ y: 0 }}>
                        Muvaffaqiyatli! 🎉
                      </motion.div>
                    )}
                    <ArrowRight className="absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" size={24} />
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Product Detail Modal ── */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="card w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative max-h-[90vh] shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-white/10"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-black/40 hover:bg-black/60 flex items-center justify-center text-white z-10 transition-all border border-white/10 hover:rotate-90 shadow-xl"
              >
                <X size={24} />
              </button>

              {/* Chap taraf: Vizual */}
              <div className="md:w-1/2 h-72 md:h-auto bg-surface-lighter flex items-center justify-center relative overflow-hidden group border-r border-white/5">
                <div className="absolute inset-0 brand-gradient opacity-20 group-hover:opacity-30 transition-opacity" />
                <Package size={180} className="text-indigo-400/40 drop-shadow-[0_20px_50px_rgba(99,102,241,0.5)] relative z-10" />
                <div className="absolute bottom-8 left-8 bg-indigo-500/20 backdrop-blur-2xl border border-indigo-500/40 px-6 py-2.5 rounded-2xl text-indigo-100 text-xs font-black uppercase tracking-[0.3em] shadow-2xl">
                   Premium Selection
                </div>
              </div>

              {/* O'ng taraf: Tarkib */}
              <div className="md:w-1/2 p-10 md:p-14 flex flex-col bg-surface overflow-y-auto">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="px-4 py-1.5 rounded-xl bg-green-500/10 text-green-500 text-[11px] font-black uppercase tracking-widest border border-green-500/20 shadow-inner">
                      Sotuvda mavjud
                    </span>
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-700" />
                    <span className="text-gray-400 text-[12px] font-black uppercase tracking-tighter">
                      {selectedProduct.stock} TA OMBORDA
                    </span>
                  </div>

                  <h2 className="text-5xl font-black mb-10 leading-none tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                    {selectedProduct.name}
                  </h2>

                  <div className="flex items-center gap-5 mb-12 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/seller shadow-inner">
                    <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center text-white font-black text-xl shadow-2xl group-hover/seller:rotate-6 transition-transform">
                      {(selectedProduct.created_by_name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[11px] uppercase font-black text-gray-500 tracking-[0.2em] mb-1">Sotuvchi</p>
                      <p className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        {selectedProduct.created_by_name || 'admin'}
                      </p>
                    </div>
                    <ArrowRight className="ml-auto text-gray-700 opacity-0 group-hover/seller:opacity-100 transition-all" size={24} />
                  </div>

                  <div className="space-y-5 mb-14">
                    <p className="text-[11px] uppercase font-black text-gray-500 tracking-[0.2em] flex items-center gap-4">
                       <div className="w-12 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                       TAVSIF
                    </p>
                    <p className="text-gray-400 text-lg leading-relaxed italic font-medium pl-2 border-l-2 border-white/5">
                      "{selectedProduct.description || 'Ushbu eksklyuziv mahsulot o\'zining yuqori sifati va betakror dizayni bilan ajralib turadi. Tanlovda adashmaysiz.'}"
                    </p>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/10 mt-auto">
                  <div className="flex items-end justify-between mb-8">
                     <div>
                        <p className="text-[11px] uppercase font-black text-gray-500 tracking-widest mb-2">Tanlangan mahsulot narxi</p>
                        <p className="text-5xl font-black text-green-400 flex items-baseline gap-2 tracking-tighter leading-none">
                           <span className="text-base font-black text-green-500/40 uppercase tracking-tighter">so'm</span>
                           {fmt(selectedProduct.price).replace("so'm", "").trim()}
                        </p>
                     </div>
                     <ShoppingBag className="text-green-500/10 mb-1" size={64} />
                  </div>
                  
                  <button 
                    onClick={() => {
                      addItem({ ...selectedProduct, price: Number(selectedProduct.price), quantity: 1 });
                      setSelectedProduct(null);
                      setIsCartOpen(true);
                    }}
                    className="btn btn-primary h-20 w-full text-xl font-black shadow-[0_20px_60px_rgba(99,102,241,0.5)] flex items-center justify-center gap-5 active:scale-[0.96] transition-all rounded-[2rem] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Plus size={28} className="group-hover:rotate-180 transition-transform duration-500" />
                    SAVATGA QO'SHISH
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
