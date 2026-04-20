import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = [...get().items];
        const existing = items.find((i) => i.id === item.id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          items.push(item);
        }
        set({ items, total: calculateTotal(items) });
      },
      removeItem: (id) => {
        const items = get().items.filter((i) => i.id !== id);
        set({ items, total: calculateTotal(items) });
      },
      updateQuantity: (id, delta) => {
        const items = get().items.map((i) => {
          if (i.id === id) {
            const next = i.quantity + delta;
            return { ...i, quantity: next > 0 ? next : 1 };
          }
          return i;
        });
        set({ items, total: calculateTotal(items) });
      },
      clearCart: () => set({ items: [], total: 0 }),
      total: 0,
    }),
    { name: 'cart-storage' }
  )
);

function calculateTotal(items: CartItem[]) {
  return items.reduce((acc, i) => acc + i.price * i.quantity, 0);
}
