'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { motion } from 'framer-motion';
import {
  User, Bell, Shield, Palette, Globe, Save,
  Moon, Sun, Monitor, Check, Lock, Mail, AtSign
} from 'lucide-react';
import api from '@/lib/api';

type Tab = 'profile' | 'appearance' | 'notifications' | 'security';

export default function SettingsPage() {
  const { username, role } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [tab, setTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  // Profile form
  const [email, setEmail]     = useState('');
  const [display, setDisplay] = useState(username ?? '');

  // Password form
  const [oldPass, setOldPass]     = useState('');
  const [newPass, setNewPass]     = useState('');
  const [newPass2, setNewPass2]   = useState('');
  const [passErr, setPassErr]     = useState('');

  // Notifications
  const [notifs, setNotifs] = useState({
    newOrder:    true,
    orderUpdate: true,
    lowStock:    true,
    newMessage:  true,
    newUser:     false,
  });

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile',       label: 'Profil',           icon: User    },
    { key: 'appearance',    label: 'Ko\'rinish',        icon: Palette },
    { key: 'notifications', label: 'Bildirishnomalar', icon: Bell    },
    { key: 'security',      label: 'Xavfsizlik',       icon: Shield  },
  ];

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const saveProfile = () => { showSaved(); };

  const savePassword = () => {
    setPassErr('');
    if (!oldPass || !newPass) { setPassErr('Barcha maydonlar to\'ldirilishi shart'); return; }
    if (newPass !== newPass2) { setPassErr('Yangi parollar mos kelmadi'); return; }
    showSaved();
    setOldPass(''); setNewPass(''); setNewPass2('');
  };

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
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Shaxsiy ma\'lumotlar</h3>
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-5 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center text-white font-black text-2xl glow-brand">
                    {display?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{display || username}</p>
                    <span className="badge badge-active text-[10px]">{roleNames[role ?? ''] ?? 'Foydalanuvchi'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Foydalanuvchi nomi
                    </label>
                    <div className="relative">
                      <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input className="input pl-9" value={display} onChange={e => setDisplay(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Email manzil
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input className="input pl-9" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-5">
                  <button className="btn btn-primary gap-2" onClick={saveProfile}>
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
                    const active = theme === opt.key || (opt.key === 'system' && false);
                    return (
                      <button key={opt.key}
                        onClick={() => opt.key !== 'system' && setTheme(opt.key as 'dark' | 'light')}
                        className={`card p-4 text-left transition-all ${active ? 'border-indigo-500/40' : ''}`}
                        style={{ borderColor: active ? 'rgba(99,102,241,0.5)' : '', background: active ? 'rgba(99,102,241,0.07)' : '' }}>
                        <div className="flex items-center justify-between mb-3">
                          <opt.icon size={18} style={{ color: active ? 'var(--brand)' : 'var(--text-muted)' }} />
                          {active && <Check size={13} className="text-indigo-400" />}
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

          {/* ── Notifications ── */}
          {tab === 'notifications' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
              <div className="card p-5 space-y-1.5">
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Bildirishnoma sozlamalari</h3>
                {[
                  { key: 'newOrder',    label: 'Yangi buyurtmalar',        desc: 'Har bir yangi buyurtmada xabar ol' },
                  { key: 'orderUpdate', label: 'Buyurtma holati o\'zgardi', desc: 'Status yangilanganda xabar ol' },
                  { key: 'lowStock',    label: 'Mahsulot tugayapti',        desc: '10 tadan kam qoldida ogohlantir' },
                  { key: 'newMessage',  label: 'Yangi xabar',               desc: 'Chat orqali xabar kelganda' },
                  { key: 'newUser',     label: 'Yangi foydalanuvchi',       desc: 'Yangi ro\'yxatdan o\'tganda' },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between py-3.5 border-b last:border-b-0"
                    style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{n.label}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key as keyof typeof p] }))}
                      className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
                      style={{
                        background: notifs[n.key as keyof typeof notifs] ? 'var(--brand)' : 'var(--bg-overlay)',
                        boxShadow: notifs[n.key as keyof typeof notifs] ? '0 0 12px rgba(99,102,241,0.3)' : 'none'
                      }}>
                      <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                        style={{ left: notifs[n.key as keyof typeof notifs] ? '22px' : '4px' }} />
                    </button>
                  </div>
                ))}
                <div className="flex justify-end pt-3">
                  <button className="btn btn-primary gap-2" onClick={showSaved}>
                    {saved ? <><Check size={14} /> Saqlandi!</> : <><Save size={14} /> Saqlash</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Security ── */}
          {tab === 'security' && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
              <div className="card p-5">
                <h3 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Parolni o'zgartirish</h3>
                {passErr && (
                  <div className="flex items-center gap-2 p-3 rounded-lg mb-4"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p className="text-[13px]" style={{ color: 'var(--danger)' }}>{passErr}</p>
                  </div>
                )}
                <div className="space-y-4">
                  {[
                    { label: 'Joriy parol',     val: oldPass, set: setOldPass },
                    { label: 'Yangi parol',      val: newPass, set: setNewPass },
                    { label: 'Yangi parol (takror)', val: newPass2, set: setNewPass2 },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-[12px] font-semibold mb-1.5 uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input className="input pl-9" type="password" placeholder="••••••••"
                          value={f.val} onChange={e => f.set(e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-5">
                  <button className="btn btn-primary gap-2" onClick={savePassword}>
                    {saved ? <><Check size={14} /> Saqlandi!</> : <><Shield size={14} /> Yangilash</>}
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
