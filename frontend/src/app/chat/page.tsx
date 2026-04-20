'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, Phone, Video, MoreHorizontal, Check, CheckCheck } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { username } = useAuthStore();
  const ws = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('chat/').then(r => setMessages([...r.data].reverse())).catch(console.error);
    const token = Cookies.get('token');
    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}`);
    ws.current.onmessage = (ev: MessageEvent) => {
      const d = JSON.parse(ev.data);
      setMessages(prev => [...prev, { id: Date.now(), sender_name: d.sender, content: d.message }]);
    };
    return () => ws.current?.close();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ message: newMessage, receiver_id: 1 }));
    setNewMessage('');
  };

  const isMe = (m: any) => m.sender_name === username;

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden" style={{ background:'var(--bg-base)' }}>
      {/* Conversation list */}
      <aside className="w-[280px] flex flex-col border-r flex-shrink-0" style={{ background:'var(--bg-surface)', borderColor:'var(--border)' }}>
        <div className="p-3 border-b" style={{ borderColor:'var(--border)' }}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }} />
            <input className="input pl-9 py-2 text-sm" placeholder="Search…" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Active conversation */}
          <div className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
            style={{ background:'rgba(99,102,241,0.08)', borderLeft:'2px solid var(--brand)' }}>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm">A</div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2" style={{ background:'var(--success)', borderColor:'var(--bg-surface)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <p className="text-[13px] font-semibold truncate" style={{ color:'var(--text-primary)' }}>Admin Support</p>
                <p className="text-[11px] flex-shrink-0 ml-2" style={{ color:'var(--text-muted)' }}>now</p>
              </div>
              <p className="text-[12px] truncate mt-0.5" style={{ color:'var(--text-muted)' }}>How can I help you today?</p>
            </div>
          </div>

          {/* Placeholder conversations */}
          {['Sales Team', 'Tech Support', 'Billing Dept'].map((name, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors border-t" style={{ borderColor:'var(--border)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0" style={{ background:'var(--bg-overlay)', color:'var(--text-secondary)' }}>
                {name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <p className="text-[13px] font-medium truncate" style={{ color:'var(--text-secondary)' }}>{name}</p>
                  <p className="text-[11px] flex-shrink-0 ml-2" style={{ color:'var(--text-muted)' }}>2d</p>
                </div>
                <p className="text-[12px] truncate mt-0.5" style={{ color:'var(--text-muted)' }}>Tap to open conversation</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-14 flex items-center px-5 gap-3 border-b glass flex-shrink-0" style={{ borderColor:'var(--border)' }}>
          <div className="relative">
            <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm">A</div>
            <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full border" style={{ background:'var(--success)', borderColor:'var(--bg-surface)' }} />
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color:'var(--text-primary)' }}>Admin Support</p>
            <p className="text-[11px]" style={{ color:'var(--success)' }}>Online</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg"><Phone size={14}/></button>
            <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg"><Video size={14}/></button>
            <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg"><MoreHorizontal size={14}/></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
          {/* Date divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background:'var(--border)' }} />
            <span className="text-[11px] px-2" style={{ color:'var(--text-muted)' }}>Today</span>
            <div className="flex-1 h-px" style={{ background:'var(--border)' }} />
          </div>

          <AnimatePresence initial={false}>
            {messages.map((m: any, i) => {
              const me = isMe(m);
              const prevSame = i > 0 && isMe(messages[i-1]) === me;
              return (
                <motion.div
                  key={m.id ?? i}
                  className={`flex ${me ? 'justify-end' : 'justify-start'} ${prevSame ? 'mt-0.5' : 'mt-3'}`}
                  initial={{ opacity:0, y:8, scale:0.97 }}
                  animate={{ opacity:1, y:0, scale:1 }}
                  transition={{ type:'spring', stiffness:400, damping:30 }}
                >
                  {!me && !prevSame && (
                    <div className="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end brand-gradient flex items-center justify-center text-white text-[11px] font-bold">
                      {m.sender_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  {!me && prevSame && <div className="w-7 mr-2 flex-shrink-0" />}
                  <div className={`px-3.5 py-2 max-w-[70%] text-[14px] leading-relaxed ${
                    me
                      ? 'rounded-2xl rounded-br-sm text-white'
                      : 'rounded-2xl rounded-bl-sm'
                  }`}
                    style={{
                      background: me ? 'var(--brand)' : 'var(--bg-elevated)',
                      color: me ? '#fff' : 'var(--text-primary)',
                      boxShadow: me ? '0 2px 12px rgba(99,102,241,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {m.content}
                    {me && (
                      <CheckCheck size={11} className="inline ml-1.5 opacity-70" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full brand-gradient flex items-center justify-center text-white text-[11px] font-bold">A</div>
            <div className="flex items-center gap-1 px-3 py-2.5 rounded-2xl rounded-bl-sm" style={{ background:'var(--bg-elevated)' }}>
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background:'var(--text-muted)' }}
                  animate={{ y:[0,-4,0] }}
                  transition={{ duration:0.8, delay:i*0.15, repeat:Infinity }}
                />
              ))}
            </div>
          </div>

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={send} className="flex items-center gap-3 px-5 py-3 border-t glass" style={{ borderColor:'var(--border)' }}>
          <input
            className="input flex-1 py-2.5"
            placeholder="Type a message…"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <motion.button
            type="submit"
            className="btn btn-primary w-10 h-10 p-0 rounded-xl flex-shrink-0"
            whileHover={{ scale:1.05 }}
            whileTap={{ scale:0.95 }}
            disabled={!newMessage.trim()}
            style={{ opacity: newMessage.trim() ? 1 : 0.4 }}
          >
            <Send size={16} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
