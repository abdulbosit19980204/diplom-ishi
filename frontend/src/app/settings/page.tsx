'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Shield, Palette, Save,
  Moon, Sun, Monitor, Check, Lock, Mail, Phone, FileText
} from 'lucide-react';

type Tab = 'profile' | 'appearance' | 'security';

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

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar tabs */}
        <nav className="w-full md:w-44 flex-shrink-0 space-y-1">
          {tabs.map(t => (
            <button key={t.key}
              onClick={() => setTab(t.key)}
              className={`nav-link w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${tab === t.key ? 'bg-indigo-500/10 text-indigo-400 font-bold' : 'text-gray-500 hover:text-gray-300'}`}>
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          <AnimatePresence mode="wait">
            {tab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-4">
                <div className="card p-5">
                  <h3 className="font-semibold mb-4">Shaxsiy ma'lumotlar</h3>
                  {error && <div className="p-3 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}
                  <div className="flex items-center gap-4 mb-5 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center text-white font-black text-2xl">
                      {(profile.first_name?.[0] || username?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{`${profile.first_name} ${profile.last_name}`.trim() || username}</p>
                      <span className="badge badge-active text-[10px]">{roleNames[role ?? ''] ?? 'Mijoz'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="label">Ism</label><input className="input" value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} /></div>
                    <div><label className="label">Familiya</label><input className="input" value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} /></div>
                    <div className="col-span-full"><label className="label">Email</label><input className="input" type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} /></div>
                    <div className="col-span-full"><label className="label">Telefon</label><input className="input" value={profile.phone_number} onChange={e => setProfile({...profile, phone_number: e.target.value})} /></div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button className="btn btn-primary gap-2 px-6" onClick={saveProfile}>
                      {saved ? <><Check size={14} /> Saqlandi!</> : <><Save size={14} /> Saqlash</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'appearance' && (
              <motion.div key="appearance" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <div className="card p-5">
                  <h3 className="font-semibold mb-5">Mavzu / rejim</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'dark',   label: 'Tungi', icon: Moon },
                      { key: 'light',  label: 'Kunduzgi', icon: Sun },
                    ].map(opt => (
                      <button key={opt.key} onClick={() => setTheme(opt.key as 'dark' | 'light')}
                        className={`card p-4 text-left transition-all ${theme === opt.key ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : 'opacity-60 hover:opacity-100'}`}>
                        <opt.icon size={18} className={theme === opt.key ? 'text-indigo-400' : 'text-gray-500'} />
                        <p className="font-semibold text-[13px] mt-2">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <div className="card p-5 space-y-4">
                  <h3 className="font-semibold mb-5">Xavfsizlik</h3>
                  {error && <div className="p-3 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}
                  <div className="space-y-4">
                    <div><label className="label">Joriy parol</label><input className="input" type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="label">Yangi parol</label><input className="input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} /></div>
                      <div><label className="label">Takrorlang</label><input className="input" type="password" value={newPass2} onChange={e => setNewPass2(e.target.value)} /></div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button className="btn btn-primary gap-2 px-6" onClick={savePassword} disabled={passLoading}>
                      <Shield size={14} /> {passLoading ? 'Yangilanmoqda…' : 'Parolni yangilash'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
