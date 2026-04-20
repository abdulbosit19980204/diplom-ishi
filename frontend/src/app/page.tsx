'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react';

const features = [
  { icon:BarChart3,   title:'Real-Time Analytics', desc:'Live revenue, orders, and user metrics updated every minute.' },
  { icon:Zap,         title:'Lightning Fast',       desc:'Built on Next.js App Router with server components for peak performance.' },
  { icon:ShieldCheck, title:'Role-Based Access',    desc:'Admin, Manager, and Customer roles with granular permission control.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background:'var(--bg-base)' }}>
      {/* Nav */}
      <nav className="h-14 flex items-center justify-between px-8 border-b sticky top-0 z-50 glass" style={{ borderColor:'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg brand-gradient flex items-center justify-center glow-brand">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="font-semibold text-[15px]" style={{ color:'var(--text-primary)' }}>ShopAdmin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"><button className="btn btn-ghost text-sm">Log in</button></Link>
          <Link href="/register"><button className="btn btn-primary text-sm px-4">Get started</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden">
        {/* Ambient glows */}
        <div style={{
          position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)',
          width:'700px', height:'400px',
          background:'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents:'none'
        }} />

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest mb-8"
            style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', color:'#818cf8' }}>
            <Zap size={11} /> Production-Ready E-Commerce Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            <span style={{ color:'var(--text-primary)' }}>Manage your store</span>
            <br />
            <span className="text-gradient">beautifully.</span>
          </h1>

          <p className="text-lg text-center max-w-xl mx-auto mb-10" style={{ color:'var(--text-muted)' }}>
            A premium SaaS dashboard for admins, managers and customers.
            Products, orders, real-time chat — all in one sleek interface.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/dashboard">
              <motion.button className="btn btn-primary px-6 py-3 text-[15px] rounded-xl" whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
                Open Dashboard <ArrowRight size={17} />
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button className="btn btn-secondary px-6 py-3 text-[15px] rounded-xl" whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
                Create Account
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Mini mockup preview */}
        <motion.div
          initial={{ opacity:0, y:32 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.7, delay:0.3 }}
          className="mt-20 w-full max-w-4xl rounded-2xl overflow-hidden border"
          style={{ borderColor:'var(--border)', background:'var(--bg-surface)', boxShadow:'0 40px 80px rgba(0,0,0,0.6)' }}
        >
          {/* Fake window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background:'var(--bg-elevated)', borderColor:'var(--border)' }}>
            <div className="w-3 h-3 rounded-full" style={{ background:'#ff5f57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background:'#febc2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background:'#28c840' }} />
            <div className="flex-1 mx-4 h-5 rounded" style={{ background:'var(--bg-overlay)' }} />
          </div>
          {/* Skeleton content */}
          <div className="flex h-48">
            <div className="w-40 border-r p-3 space-y-2" style={{ borderColor:'var(--border)', background:'var(--bg-elevated)' }}>
              {[80,65,70,55,45].map((w,i) => <div key={i} className="skeleton h-3 rounded" style={{ width:`${w}%` }} />)}
            </div>
            <div className="flex-1 p-4 grid grid-cols-4 gap-3 content-start">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-xl p-3" style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)' }}>
                  <div className="skeleton h-2 w-2/3 mb-2 rounded" />
                  <div className="skeleton h-5 w-full rounded" />
                </div>
              ))}
              <div className="col-span-4 rounded-xl h-20" style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)' }} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="card p-6"
              initial={{ opacity:0, y:16 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ delay:i*0.1 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background:'rgba(99,102,241,0.1)' }}>
                <f.icon size={20} className="text-indigo-400" />
              </div>
              <h3 className="font-semibold mb-2" style={{ color:'var(--text-primary)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color:'var(--text-muted)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-[12px]" style={{ borderColor:'var(--border)', color:'var(--text-muted)' }}>
        © 2025 ShopAdmin. Built with Next.js & Django.
      </footer>
    </div>
  );
}
