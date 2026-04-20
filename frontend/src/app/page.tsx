'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, BarChart3, ShieldCheck, MessageSquare,
  Package, ShoppingCart, Users, Zap, Star,
  CheckCircle2, TrendingUp, Globe, Lock
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const features = [
  {
    icon: BarChart3,
    title: "Real-vaqt analitika",
    desc: "Daromad, buyurtmalar va mijozlar statistikasi — har daqiqa yangilanadi.",
    grad: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  },
  {
    icon: Package,
    title: "Mahsulot boshqaruvi",
    desc: "Qo'shish, tahrirlash, o'chirish. Ombor kuzatuvi va ogohlantirishlar.",
    grad: "linear-gradient(135deg,#10b981,#059669)",
  },
  {
    icon: ShoppingCart,
    title: "Buyurtmalar tizimi",
    desc: "Status kuzatuvi, timeline tarixi va mijoz uchun qulay interfeys.",
    grad: "linear-gradient(135deg,#06b6d4,#3b82f6)",
  },
  {
    icon: MessageSquare,
    title: "Real-vaqt chat",
    desc: "WebSocket orqali tezkor aloqa. Buyurtmaga bog'langan suhbatlar.",
    grad: "linear-gradient(135deg,#f59e0b,#ef4444)",
  },
  {
    icon: Users,
    title: "Foydalanuvchilar",
    desc: "Admin, Menejer, Mijoz rollari. Bloklash va ruxsat boshqaruvi.",
    grad: "linear-gradient(135deg,#ec4899,#8b5cf6)",
  },
  {
    icon: ShieldCheck,
    title: "Xavfsiz JWT auth",
    desc: "SimpleJWT bilan himoyalangan tokenlar. Rol asosida ruxsatlar.",
    grad: "linear-gradient(135deg,#14b8a6,#3b82f6)",
  },
];

const stats = [
  { value: "∞",   label: "Mahsulotlar" },
  { value: "3",   label: "Rol darajalari" },
  { value: "100%", label: "O'zbek tili" },
  { value: "0ms", label: "Real-vaqt" },
];

const steps = [
  { n: "01", title: "Ro'yxatdan o'ting",     desc: "30 soniyada hisob oching." },
  { n: "02", title: "Mahsulotlar qo'shing",   desc: "Tovarlaringizni tizimga kiriting." },
  { n: "03", title: "Buyurtmalarni boshqaring", desc: "Status, timeline, chat." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: 'var(--bg-base)' }}>

      {/* ── Navbar ── */}
      <nav className="h-14 flex items-center justify-between px-6 md:px-10 border-b sticky top-0 z-50 glass"
        style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center glow-brand">
            <span className="text-white font-black">S</span>
          </div>
          <span className="font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>ShopAdmin</span>
        </div>

        <div className="hidden md:flex items-center gap-7">
          {['Imkoniyatlar', 'Qanday ishlaydi', 'Narxlar'].map(l => (
            <a key={l} href={`#${l}`} className="text-[14px] transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              {l}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <button className="btn btn-ghost text-[13px] px-4 py-2">Kirish</button>
          </Link>
          <Link href="/register">
            <motion.button className="btn btn-primary text-[13px] px-4 py-2"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              Boshlash
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center text-center px-6 py-28 md:py-36 overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute pointer-events-none inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
            style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.16) 0%, transparent 65%)' }} />
          <div className="absolute top-32 left-1/4 w-48 h-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)' }} />
          <div className="absolute top-20 right-1/4 w-32 h-32 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-semibold tracking-wide mb-8"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
            <Zap size={12} /> O'zbek tilidagi yagona e-commerce boshqaruv tizimi
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 max-w-4xl">
            <span style={{ color: 'var(--text-primary)' }}>Do'koningizni</span>
            <br />
            <span className="text-gradient">qudratli tarzda boshqaring.</span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Mahsulotlar, buyurtmalar, mijozlar, real-vaqt chat va analitika —
            barchasi bitta zamonaviy interfeysda. Admins, menejerlar va mijozlar uchun.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register">
              <motion.button className="btn btn-primary px-7 py-3.5 text-[15px] rounded-xl gap-2"
                whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
                whileTap={{ scale: 0.97 }}>
                Bepul boshlash <ArrowRight size={17} />
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button className="btn btn-secondary px-7 py-3.5 text-[15px] rounded-xl"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                Dashboard ko'rish
              </motion.button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
            <span className="text-[13px] ml-1" style={{ color: 'var(--text-muted)' }}>
              Premium sifat · O'zbek tili · To'liq funksional
            </span>
          </div>
        </motion.div>

        {/* Browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 w-full max-w-5xl rounded-2xl overflow-hidden border"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-surface)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
          }}>
          {/* Chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
            </div>
            <div className="flex-1 mx-4 h-5 rounded-md flex items-center px-3" style={{ background: 'var(--bg-overlay)' }}>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>localhost:3000/dashboard</span>
            </div>
          </div>
          {/* Dashboard preview skeleton */}
          <div className="flex h-64">
            {/* Sidebar */}
            <div className="w-44 border-r p-3 space-y-2 flex-shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className="w-5 h-5 rounded brand-gradient" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
              {[90, 70, 80, 60, 75, 55].map((w, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                  style={{ background: i === 0 ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
                  <div className="w-3.5 h-3.5 rounded skeleton" />
                  <div className="skeleton h-2.5 rounded" style={{ width: `${w}%`, opacity: i === 0 ? 0.9 : 0.5 }} />
                </div>
              ))}
            </div>
            {/* Main content */}
            <div className="flex-1 p-5" style={{ background: 'var(--bg-base)' }}>
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {['#6366f1', '#06b6d4', '#10b981', '#f59e0b'].map((c, i) => (
                  <div key={i} className="rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="skeleton h-2.5 w-16 rounded" />
                      <div className="w-5 h-5 rounded-lg" style={{ background: `${c}30` }} />
                    </div>
                    <div className="h-5 w-14 rounded skeleton" style={{ opacity: 0.8 }} />
                  </div>
                ))}
              </div>
              {/* Chart placeholder */}
              <div className="flex gap-3 h-28">
                <div className="flex-1 rounded-xl p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="skeleton h-2.5 w-24 rounded mb-3" />
                  <div className="flex items-end gap-1 h-16">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <motion.div key={i} className="flex-1 rounded-t-sm"
                        style={{ background: 'linear-gradient(180deg,#818cf8,#6366f1)', opacity: 0.7 }}
                        initial={{ height: 0 }} animate={{ height: `${h}%` }}
                        transition={{ delay: 0.8 + i * 0.06, duration: 0.5 }} />
                    ))}
                  </div>
                </div>
                <div className="w-36 rounded-xl p-3 space-y-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="skeleton h-2.5 w-20 rounded" />
                  {[75, 55, 40, 30].map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded skeleton" />
                      <div className="flex-1 skeleton h-2 rounded" style={{ width: `${w}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y py-10" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6 text-center">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <p className="text-3xl font-extrabold text-gradient">{s.value}</p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="Imkoniyatlar" className="px-6 py-24 max-w-6xl mx-auto w-full">
        <motion.div className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand)' }}>
            Imkoniyatlar
          </p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Barcha kerakli vositalar
          </h2>
          <p className="text-[15px] mt-3" style={{ color: 'var(--text-muted)' }}>
            Zamonaviy e-commerce platformasi uchun hamma narsa bitta joyda.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={i} className="card p-6 group cursor-default"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: f.grad, boxShadow: `0 4px 16px ${f.grad.match(/#\w+/)?.[0]}40` }}>
                <f.icon size={20} color="white" />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="Qanday ishlaydi" className="px-6 py-24" style={{ background: 'var(--bg-surface)' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand)' }}>
              Qanday ishlaydi
            </p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              3 qadamda boshlang
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} className="relative"
                initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px z-0"
                    style={{ background: 'linear-gradient(90deg,var(--border),transparent)' }} />
                )}
                <div className="card p-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center text-white font-black text-lg mb-4"
                    style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-[15px] mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative px-6 py-28 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 60%)' }} />
        <motion.div className="relative max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="flex justify-center mb-5">
            {[CheckCircle2, TrendingUp, Globe, Lock].map((Icon, i) => (
              <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center -ml-2 first:ml-0"
                style={{ background: 'var(--bg-elevated)', border: '2px solid var(--bg-base)' }}>
                <Icon size={16} className="text-indigo-400" />
              </div>
            ))}
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4" style={{ color: 'var(--text-primary)' }}>
            Bugunoq boshlang
          </h2>
          <p className="text-[15px] mb-8" style={{ color: 'var(--text-muted)' }}>
            Do'koningizni zamonaviy tizim bilan boshqaring. Bepul va tez.
          </p>
          <Link href="/register">
            <motion.button
              className="btn btn-primary px-10 py-4 text-[16px] rounded-2xl gap-2"
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99,102,241,0.45)' }}
              whileTap={{ scale: 0.97 }}>
              Hoziroq boshlash <ArrowRight size={18} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8 px-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg brand-gradient flex items-center justify-center">
              <span className="text-white font-black text-xs">S</span>
            </div>
            <span className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>ShopAdmin</span>
          </div>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            © 2025 ShopAdmin. Django REST + Next.js bilan qurilgan.
          </p>
          <div className="flex items-center gap-5">
            {['Kirish', "Ro'yxat", 'Dashboard'].map(l => (
              <Link key={l} href={`/${l === 'Kirish' ? 'login' : l === "Ro'yxat" ? 'register' : 'dashboard'}`}
                className="text-[12px] transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
