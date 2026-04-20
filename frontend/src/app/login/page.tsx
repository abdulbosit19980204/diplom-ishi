'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore(s => s.setAuth);
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('auth/login/', { username, password });
      const { access, role, user_username, user_id, is_superuser } = res.data;
      setAuth(access, role || 'CUSTOMER', user_username || username, user_id, !!is_superuser);
      router.push('/dashboard');
    } catch {
      setError("Foydalanuvchi nomi yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.12) 0%, transparent 60%)'
      }} />

      <motion.div className="w-full max-w-sm z-10"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center glow-brand">
            <span className="text-white font-black text-lg">S</span>
          </div>
          <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>ShopAdmin</span>
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Tizimga kirish</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Hisobingizga kiring davom etish uchun</p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
              <p className="text-[13px]" style={{ color: 'var(--danger)' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Foydalanuvchi nomi
              </label>
              <input className="input" placeholder="username" value={username}
                onChange={e => setUsername(e.target.value)} required />
            </div>
            <div>
              <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Parol
              </label>
              <input className="input" type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>
            <motion.button type="submit" className="btn btn-primary w-full gap-2 mt-2"
              whileTap={{ scale: 0.97 }} disabled={loading}>
              <LogIn size={15} />
              {loading ? 'Kirish…' : 'Kirish'}
            </motion.button>
          </form>

          <p className="mt-5 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Hisobingiz yo'qmi?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
              Ro'yxatdan o'ting
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
