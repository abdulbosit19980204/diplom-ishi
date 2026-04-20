'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ShieldCheck, UserX, ChevronDown, Search,
  MoreHorizontal, UserCheck, Edit2, Trash2, X, AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface UserItem {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

const ROLES = ['ADMIN', 'MANAGER', 'CUSTOMER'];
const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin', MANAGER: 'Menejer', CUSTOMER: 'Mijoz'
};

export default function UsersPage() {
  const { role, isSuperuser } = useAuthStore();
  const router = useRouter();
  const [users, setUsers]             = useState<UserItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterRole, setFilterRole]   = useState('ALL');
  const [editUser, setEditUser]       = useState<UserItem | null>(null);
  const [editRole, setEditRole]       = useState('');
  const [saving, setSaving]           = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<UserItem | null>(null);

  useEffect(() => {
    if (!isSuperuser && role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    api.get('users/').then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [role, isSuperuser, router]);

  const filtered = users.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole === 'ALL' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const toggleActive = async (user: UserItem) => {
    await api.patch(`users/${user.id}/toggle-active/`);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
  };

  const changeRole = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await api.patch(`users/${editUser.id}/set-role/`, { role: editRole });
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, role: editRole } : u));
      setEditUser(null);
    } finally {
      setSaving(false);
    }
  };

  const roleBadge = (role: string) => ({
    ADMIN:    'badge-active',
    MANAGER:  'badge-shipped',
    CUSTOMER: 'badge-pending',
  }[role] ?? 'badge-pending');

  const stats = [
    { label: "Jami foydalanuvchilar", value: users.length,                                   color: 'var(--brand)' },
    { label: "Adminlar",              value: users.filter(u => u.role === 'ADMIN').length,    color: 'var(--info)' },
    { label: "Menejerlar",            value: users.filter(u => u.role === 'MANAGER').length,  color: 'var(--success)' },
    { label: "Faol mijozlar",         value: users.filter(u => u.role === 'CUSTOMER' && u.is_active).length, color: 'var(--warning)' },
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Foydalanuvchilar</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Barcha foydalanuvchilarni boshqaring.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} className="card p-4"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{loading ? '—' : s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input pl-9" placeholder="Ism yoki email bo'yicha…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {['ALL', ...ROLES].map(r => (
            <button key={r}
              className={`btn text-[12px] py-1.5 px-3 ${filterRole === r ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterRole(r)}>
              {r === 'ALL' ? 'Barchasi' : ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div className="card overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <table className="table-base">
          <thead>
            <tr>
              <th>Foydalanuvchi</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Holati</th>
              <th className="text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(5).fill(0).map((_, i) => (
                <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j}><div className="skeleton h-4 rounded" /></td>)}</tr>
              ))
              : filtered.map((u, i) => (
                <motion.tr key={u.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="strong text-[13px]">{u.username}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>#{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{u.email || '—'}</td>
                  <td><span className={`badge ${roleBadge(u.role)}`}>{ROLE_LABELS[u.role] ?? u.role}</span></td>
                  <td>
                    <button onClick={() => toggleActive(u)}
                      className={`badge ${u.is_active ? 'badge-delivered' : 'badge-cancelled'} cursor-pointer hover:opacity-80 transition-opacity`}>
                      {u.is_active ? 'Faol' : 'Bloklangan'}
                    </button>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg text-blue-400"
                        onClick={() => { setEditUser(u); setEditRole(u.role); }}>
                        <Edit2 size={12} />
                      </button>
                      <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg text-red-400"
                        onClick={() => setDeleteConfirm(u)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            }
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                Foydalanuvchilar topilmadi.
              </td></tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {editUser && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setEditUser(null)} />
            <motion.div className="relative w-full max-w-sm card p-6 z-10"
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Rolni o'zgartirish</h3>
                <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg" onClick={() => setEditUser(null)}><X size={14} /></button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl mb-5" style={{ background: 'var(--bg-overlay)' }}>
                <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm">
                  {editUser.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>{editUser.username}</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{editUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {ROLES.map(r => (
                  <button key={r}
                    className={`btn text-[12px] py-2 ${editRole === r ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setEditRole(r)}>
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="btn btn-secondary flex-1" onClick={() => setEditUser(null)}>Bekor</button>
                <button className="btn btn-primary flex-1" onClick={changeRole} disabled={saving}>
                  {saving ? 'Saqlanmoqda…' : 'Saqlash'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block/Unblock confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setDeleteConfirm(null)} />
            <motion.div className="relative w-full max-w-sm card p-6 z-10 text-center"
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <AlertTriangle size={24} className="mx-auto mb-3" style={{ color: 'var(--warning)' }} />
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {deleteConfirm.is_active ? 'Foydalanuvchini bloklash?' : 'Foydalanuvchini faollash?'}
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                <strong>{deleteConfirm.username}</strong> uchun kirish {deleteConfirm.is_active ? 'to\'xtatiladi' : 'tiklanadi'}.
              </p>
              <div className="flex gap-3">
                <button className="btn btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>Bekor</button>
                <button className="btn flex-1" style={{ background: 'var(--warning)', color: '#000' }}
                  onClick={() => { toggleActive(deleteConfirm); setDeleteConfirm(null); }}>
                  {deleteConfirm.is_active ? 'Bloklash' : 'Faolash'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
