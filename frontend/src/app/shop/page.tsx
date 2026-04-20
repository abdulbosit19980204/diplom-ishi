'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useCartStore, CartItem } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Search, Plus, Minus, X, CheckCircle2, 
  ArrowRight, ShoppingCart, Loader2, Package, Tag
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
}

export default function ShopPage() {
  const { role } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore();

  useEffect(() => {
    api.get('products/')
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

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
      }, 3000);
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

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Do'kon</h1>
          <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">Mahsulotlar galereyasi</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              className="input pl-9 py-2 text-sm" 
              placeholder="Qidirish..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
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
              <div key={i} className="card p-4 space-y-4">
                <div className="aspect-square rounded-2xl bg-gray-200/5 skeleton" />
                <div className="h-4 w-2/3 bg-gray-200/5 skeleton rounded" />
                <div className="h-4 w-full bg-gray-200/5 skeleton rounded" />
                <div className="flex justify-between pt-2">
                  <div className="h-6 w-20 bg-gray-200/5 skeleton rounded" />
                  <div className="h-6 w-10 bg-gray-200/5 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={48} className="text-gray-600 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Mahsulotlar topilmadi</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">Qidiruv so'rovini tekshirib ko'ring yoki keyinroq urinib ko'ring.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, idx) => (
              <motion.div 
                key={product.id}
                className="card group overflow-hidden flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {/* Image Placeholder */}
                <div className="aspect-square brand-gradient relative transition-transform group-hover:scale-105 duration-500 flex items-center justify-center opacity-80 group-hover:opacity-100">
                   <ShoppingBag size={64} className="text-white/20" />
                   <div className="absolute top-3 left-3">
                     <span className={`badge ${product.stock > 0 ? 'badge-delivered' : 'badge-cancelled'} text-[10px]`}>
                       {product.stock > 0 ? `${product.stock} dona mavjud` : 'Tugagan'}
                     </span>
                   </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-2">
                    <h3 className="font-bold text-[15px] group-hover:text-indigo-400 transition-colors line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                      {product.name}
                    </h3>
                  </div>
                  
                  <p className="text-[12px] line-clamp-2 mb-4 flex-1" style={{ color: 'var(--text-muted)' }}>
                    {product.description || "Ushbu mahsulot haqida ma'lumot yo'q."}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">Narxi</p>
                      <p className="font-black text-lg bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {fmt(product.price)}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => addItem({ ...product, price: Number(product.price), quantity: 1 })}
                      disabled={product.stock <= 0}
                      className={`btn w-10 h-10 p-0 rounded-xl flex items-center justify-center transition-all ${product.stock > 0 ? 'btn-primary shadow-lg shadow-indigo-500/20 active:scale-90' : 'opacity-30 cursor-not-allowed'}`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
            />
            <motion.aside 
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 glass border-l flex flex-col shadow-2xl"
              style={{ borderColor: 'var(--border)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 brand-gradient rounded-xl text-white">
                    <ShoppingCart size={20} />
                  </div>
                  <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Savatcha</h2>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="btn btn-ghost w-10 h-10 p-0 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                     <div className="w-20 h-20 rounded-full bg-gray-500/5 flex items-center justify-center mb-4">
                       <ShoppingCart size={32} className="text-gray-600 opacity-20" />
                     </div>
                     <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Savatchangiz bo'sh</p>
                     <p className="text-[12px] text-gray-500 mt-1">Hozircha hech narsa yo'q.</p>
                     <button 
                       onClick={() => setIsCartOpen(false)}
                       className="mt-6 btn btn-secondary text-xs px-6"
                     >
                       Shopga qaytish
                     </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                      <div className="w-16 h-16 rounded-xl brand-gradient flex-shrink-0 flex items-center justify-center text-white/30 font-black">
                        {item.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-[14px] truncate pr-2" style={{ color: 'var(--text-primary)' }}>{item.name}</h4>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-[13px] font-bold text-indigo-400 mb-3">{fmt(item.price)}</p>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-black/20 rounded-lg p-0.5">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white/5 rounded text-gray-400"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-white/5 rounded text-gray-400"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="text-[12px] font-black ml-auto" style={{ color: 'var(--text-secondary)' }}>
                           {fmt(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 glass border-t space-y-4" style={{ borderColor: 'var(--border)' }}>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[13px]" style={{ color: 'var(--text-muted)' }}>
                      <span>Mahsulotlar soni</span>
                      <span>{items.reduce((acc, i) => acc + i.quantity, 0)} dona</span>
                    </div>
                    <div className="flex justify-between text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                      <span>Jami:</span>
                      <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {fmt(total)}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={orderStatus !== 'idle'}
                    className="btn btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 group relative overflow-hidden"
                  >
                    {orderStatus === 'loading' ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : orderStatus === 'success' ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <>
                        Buyurtma berish
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                    
                    {orderStatus === 'success' && (
                      <motion.div 
                        className="absolute inset-0 bg-emerald-500 flex items-center justify-center text-white font-bold"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                      >
                        Muvaffaqiyatli! 🎉
                      </motion.div>
                    )}
                  </button>
                  
                  <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest font-bold">
                    Buyurtma tasdiqlangandan so'ng xabar olasiz
                  </p>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
