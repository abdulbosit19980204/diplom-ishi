'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('products/').then(res => setProducts(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shop Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl shadow p-5">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="text-gray-500 text-sm mt-2">{p.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold text-lg">${p.price}</span>
                <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Buy</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
