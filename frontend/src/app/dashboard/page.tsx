'use client';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingCart, Users, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const kpis = [
  { label:'Total Revenue',  value:'$48,295', delta:'+12.5%', up:true,  icon:DollarSign,  glow:'kpi-glow-blue'   },
  { label:'New Orders',     value:'2,841',   delta:'+8.2%',  up:true,  icon:ShoppingCart, glow:'kpi-glow-purple' },
  { label:'Active Users',   value:'14,320',  delta:'-1.3%',  up:false, icon:Users,        glow:'kpi-glow-green'  },
  { label:'Avg. Basket',    value:'$133.40', delta:'+4.7%',  up:true,  icon:TrendingUp,   glow:'kpi-glow-amber'  },
];

const orders = [
  { id:'#3821', customer:'Alice Johnson', product:'AirPods Pro',  status:'delivered', amount:'$199', date:'Apr 20' },
  { id:'#3820', customer:'Bob Smith',     product:'MacBook Air',  status:'shipped',   amount:'$1099',date:'Apr 20' },
  { id:'#3819', customer:'Carol White',   product:'iPhone 15',    status:'pending',   amount:'$899', date:'Apr 19' },
  { id:'#3818', customer:'Dan Brown',     product:'Apple Watch',  status:'cancelled', amount:'$399', date:'Apr 19' },
  { id:'#3817', customer:'Eve Davis',     product:'iPad mini',    status:'shipped',   amount:'$499', date:'Apr 18' },
];

const bars = [55, 78, 42, 91, 64, 83, 37, 97, 71, 88, 53, 100];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DashboardPage() {
  const { username } = useAuthStore();

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color:'var(--text-primary)' }}>
          Good evening, {username ?? 'Admin'} 👋
        </h1>
        <p className="mt-0.5 text-sm" style={{ color:'var(--text-muted)' }}>
          Here's what's happening with your store today.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            className={`card p-5 relative overflow-hidden ${k.glow}`}
            initial={{ opacity:0, y:16 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: i*0.08 }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[13px] font-medium" style={{ color:'var(--text-muted)' }}>{k.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(99,102,241,0.1)' }}>
                <k.icon size={15} className="text-indigo-400" />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color:'var(--text-primary)' }}>{k.value}</p>
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${k.up ? 'text-green-400' : 'text-red-400'}`}>
              {k.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {k.delta} vs last month
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart + Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        {/* Revenue Chart */}
        <motion.div className="card p-6" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold" style={{ color:'var(--text-primary)' }}>Revenue</h3>
              <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>Monthly overview</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-indigo-400">$48,295</p>
              <p className="text-xs text-green-400">+12.5% this month</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-40 mt-2">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 flex flex-col items-center gap-1"
                initial={{ height:0 }}
                animate={{ height:'100%' }}
                transition={{ delay: 0.3 + i*0.04 }}
              >
                <div
                  className="w-full rounded-t-sm transition-colors cursor-pointer"
                  style={{
                    height:`${h}%`,
                    background: h === 100
                      ? 'linear-gradient(180deg,#818cf8,#6366f1)'
                      : 'rgba(99,102,241,0.25)'
                  }}
                  title={`${months[i]}: ${h}%`}
                />
                <span style={{ fontSize:'10px', color:'var(--text-muted)' }}>{months[i]}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div className="card p-5 flex flex-col" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
          <h3 className="font-semibold mb-4" style={{ color:'var(--text-primary)' }}>Activity</h3>
          <ul className="space-y-4 flex-1 overflow-y-auto">
            {[
              { text:'New order #3821 placed',   time:'2m ago',  dot:'var(--brand)' },
              { text:'Alice upgraded to Pro',    time:'18m ago', dot:'var(--success)' },
              { text:'Order #3818 cancelled',    time:'1h ago',  dot:'var(--danger)' },
              { text:'Payment confirmed $1099',  time:'2h ago',  dot:'var(--success)' },
              { text:'New review: ⭐⭐⭐⭐⭐',  time:'3h ago',  dot:'var(--warning)' },
            ].map((a, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: a.dot }} />
                <div className="flex-1">
                  <p className="text-[13px]" style={{ color:'var(--text-secondary)' }}>{a.text}</p>
                  <p className="text-[11px] mt-0.5" style={{ color:'var(--text-muted)' }}>{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Orders Table */}
      <motion.div className="card overflow-hidden" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'var(--border)' }}>
          <h3 className="font-semibold" style={{ color:'var(--text-primary)' }}>Recent Orders</h3>
          <a href="/orders" className="text-[13px] text-indigo-400 hover:text-indigo-300 transition">View all →</a>
        </div>
        <table className="table-base">
          <thead>
            <tr>
              <th>Order</th><th>Customer</th><th>Product</th>
              <th>Status</th><th>Date</th><th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={i}>
                <td className="strong font-mono text-[13px]">{o.id}</td>
                <td className="strong">{o.customer}</td>
                <td>{o.product}</td>
                <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>{o.date}</td>
                <td className="text-right strong">{o.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
