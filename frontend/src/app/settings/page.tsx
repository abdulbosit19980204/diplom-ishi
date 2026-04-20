'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { motion } from 'framer-motion';
import {
  User, Bell, Shield, Palette, Save,
  Moon, Sun, Monitor, Check, Lock, Mail, AtSign, Phone, FileText
} from 'lucide-react';

type Tab = 'profile' | 'appearance' | 'notifications' | 'security';

export default function SettingsPage() {
  const { username, role } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [tab, setTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Profile data
  const [profile, setProfile] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    bio: ''
  });

  // Password form
  const [oldPass, setOldPass]     = useState('');
  const [newPass, setNewPass]     = useState('');
  const [newPass2, setNewPass2]   = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    api.get('auth/profile/')
      .then(r => setProfile(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const saveProfile = async () => {
    setError('');
    try {
      await api.patch('auth/profile/', profile);
      showSaved();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Xatolik yuz berdi');
    }
  };

  const savePassword = async () => {
    setError('');
    if (newPass !== newPass2) { setError('Yangi parollar mos kelmadi'); return; }
    setPassLoading(true);
    try {
      await api.put('auth/change-password/', {
        old_password: oldPass,
        new_password: newPass
      });
      showSaved();
      setOldPass(''); setNewPass(''); setNewPass2('');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Eski parol noto\'g\'ri');
    } finally {
      setPassLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile',       label: 'Profil',           icon: User    },
    { key: 'appearance',    label: 'Ko\'rinish',        icon: Palette },
    { key: 'security',      label: 'Xavfsizlik',       icon: Shield  },
  ];

  const roleNames: Record<string, string> = {
    ADMIN: 'Admin', MANAGER: 'Menejer', CUSTOMER: 'Mijoz'
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Sozlamalar</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Hisobingiz va tizim parametrlarini boshqaring.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <nav className="w-44 flex-shrink-0 space-y-1">
          {tabs.map(t => (
            <button key={t.key}
              onClick={() => setTab(t.key)}
              className={`nav-link w-full text-left ${tab === t.key ? 'active' : ''}`}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* ── Profile ── */}
          {tab === 'profile' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="card p-5">
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Shaxsiy ma'lumotlar</h3>
                
                {error && tab === 'profile' && (
                  <div className="p-3 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-5 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center text-white font-black text-2xl glow-brand">
                    {loading ? '…' : (profile.first_name?.[0] || username?.[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {loading ? 'Yuklanmoqda…' : `${profile.first_name} ${profile.last_name}`.trim() || username}
                    </p>
                    <span className="badge badge-active text-[10px]">{roleNames[role ?? ''] ?? 'Foydalanuvchi'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider text-gray-500">Ism</label>
                    <input className="input" value={profile.first_name} 
                      onChange={e => setProfile({...profile, first_name: e.target.value})} placeholder="Ismingiz" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider text-gray-500">Familiya</label>
                    <input className="input" value={profile.last_name} 
                      onChange={e => setProfile({...profile, last_name: e.target.value})} placeholder="Familiyangiz" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider text-gray-500">Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input className="input pl-9" type="email" value={profile.email} 
                        onChange={e => setProfile({...profile, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider text-gray-500">Telefon</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input className="input pl-9" value={profile.phone_number} 
                        onChange={e => setProfile({...profile, phone_number: e.target.value})} placeholder="+998 90 123 45 67" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider text-gray-500">Bio (O'zingiz haqida)</label>
                    <div className="relative">
                      <FileText size={14} className="absolute left-3 top-3 text-gray-500" />
                      <textarea className="input pl-9 min-h-[80px] pt-2" value={profile.bio} 
                        onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Qisqacha ma'lumot…" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button className="btn btn-primary gap-2 px-6" onClick={saveProfile} disabled={loading}>
                    {saved ? <><Check size={14} /> Saqlandi!</> : <><Save size={14} /> Saqlash</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Appearance ── */}
          {tab === 'appearance' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
              <div className="card p-5">
                <h3 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Mavzu / rejim</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'dark',   label: 'Tungi', icon: Moon,    desc: 'Qorong\'u fon' },
                    { key: 'light',  label: 'Kunduzgi', icon: Sun,   desc: 'Ochiq fon' },
                    { key: 'system', label: 'Tizim',  icon: Monitor, desc: 'OS ga ko\'ra' },
                  ].map(opt => {
                    const active = theme === opt.key;
                    return (
                      <button key={opt.key}
                        onClick={() => opt.key !== 'system' && setTheme(opt.key as 'dark' | 'light')}
                        className={`card p-4 text-left transition-all ${active ? 'border-primary shadow-lg shadow-primary/10' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
                        style={{ borderColor: active ? 'var(--brand)' : 'var(--border)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <opt.icon size={18} style={{ color: active ? 'var(--brand)' : 'var(--text-muted)' }} />
                          {active && <Check size={13} className="text-primary" />}
                        </div>
                        <p className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>{opt.label}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Security ── */}
          {tab === 'security' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="card p-5">
                <h3 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Parol va Xavfsizlik</h3>
                
                {error && tab === 'security' && (
                  <div className="p-3 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider text-gray-500">Joriy parol</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input className="input pl-9" type="password" placeholder="••••••••"
                        value={oldPass} onChange={e => setOldPass(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider text-gray-500">Yangi parol</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input className="input pl-9" type="password" placeholder="••••••••"
                          value={newPass} onChange={e => setNewPass(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-wider text-gray-500">Parolni takrorlang</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input className="input pl-9" type="password" placeholder="••••••••"
                          value={newPass2} onChange={e => setNewPass2(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button className="btn btn-primary gap-2 px-6" onClick={savePassword} disabled={passLoading}>
                    {passLoading ? 'Yangilanmoqda…' : saved ? <><Check size={14} /> Saqlandi!</> : <><Shield size={14} /> Yangilash</>}
                  </button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="card p-5 mt-4" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--danger)' }}>Xavfli zona</h3>
                <p className="text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>Bu amalni qaytarib bo'lmaydi.</p>
                <button className="btn text-[13px] px-4 py-2" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  Hisobni o'chirish
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
