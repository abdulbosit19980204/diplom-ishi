'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get('orders/').then(res => setOrders(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Order #{o.id} - {o.user_name}</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                  {o.status}
                </span>
              </div>
              <p className="mt-2 text-gray-600">Total: ${o.total_price}</p>
            </div>
          ))}
          {orders.length === 0 && <p className="text-gray-500">No orders found.</p>}
        </div>
      </div>
    </div>
  );
}
