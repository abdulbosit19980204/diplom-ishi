'use client';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function DashboardPage() {
  const { username, role, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-lg text-gray-700 mb-6">Welcome, <strong>{username}</strong>! (Role: {role})</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/products" className="bg-blue-100 p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-blue-800">Products</h2>
            <p className="text-blue-600 mt-2">Manage or view products</p>
          </Link>
          <Link href="/orders" className="bg-green-100 p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-green-800">Orders</h2>
            <p className="text-green-600 mt-2">View your orders</p>
          </Link>
          <Link href="/chat" className="bg-purple-100 p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold text-purple-800">Chat & Support</h2>
            <p className="text-purple-600 mt-2">Message admins or customers</p>
          </Link>
        </div>

        <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
          Logout
        </button>
      </div>
    </div>
  );
}
