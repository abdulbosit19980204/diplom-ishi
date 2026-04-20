'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search, Phone, Video, MoreHorizontal,
  CheckCheck, Check, Circle, Wifi, WifiOff
} from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  sender_id: number;
  message: string;
  timestamp: string;
  order_id?: string;
}

interface Conversation {
  user_id: number;
  username: string;
  role: string;
  last_message: string;
  timestamp: string;
  unread: number;
}

export default function ChatPage() {
  const { username } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [activePeer, setActivePeer]       = useState<Conversation | null>(null);
  const [newMessage, setNewMessage]       = useState('');
  const [connected, setConnected]         = useState(false);
  const [searchQ, setSearchQ]             = useState('');
  const ws      = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Connect WebSocket
  const connect = useCallback(() => {
    const token = Cookies.get('token');
    if (!token) return;
    ws.current?.close();
    const socket = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}`);
    socket.onopen  = () => setConnected(true);
    socket.onclose = () => { setConnected(false); setTimeout(connect, 3000); };
    socket.onerror = () => setConnected(false);
    socket.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === 'chat_message') {
        setMessages(prev => {
          // Avoid duplicate if we already echoed it
          if (prev.find(m => m.id === data.id)) return prev;
          return [...prev, {
            id: data.id,
            sender: data.sender,
            sender_id: data.sender_id,
            message: data.message,
            timestamp: data.timestamp,
          }];
        });
        // Update conversation last message
        setConversations(prev => prev.map(c =>
          c.user_id === data.sender_id
            ? { ...c, last_message: data.message, timestamp: data.timestamp }
            : c
        ));
      }
    };
    ws.current = socket;
  }, []);

  useEffect(() => {
    connect();
    loadConversations();
    return () => ws.current?.close();
  }, [connect]);

  const loadConversations = async () => {
    try {
      const r = await api.get('chat/conversations/');
      setConversations(r.data);
    } catch {}
  };

  const openConversation = async (conv: Conversation) => {
    setActivePeer(conv);
    setMessages([]);
    try {
      const r = await api.get(`chat/?user_id=${conv.user_id}`);
      setMessages(r.data.map((m: any) => ({
        id: m.id,
        sender: m.sender_name,
        sender_id: m.sender,
        message: m.content,
        timestamp: m.timestamp,
      })));
    } catch {}
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    const payload = {
      message: newMessage.trim(),
      receiver_id: activePeer?.user_id,
    };
    ws.current.send(JSON.stringify(payload));
    // Optimistic add
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: username!,
      sender_id: -1,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    }]);
    setNewMessage('');
  };

  const isMe = (msg: Message) => msg.sender === username;

  const filtered = conversations.filter(c =>
    c.username.toLowerCase().includes(searchQ.toLowerCase())
  );

  const getRoleLabel = (role: string) => ({
    ADMIN: 'Admin', MANAGER: 'Menejer', CUSTOMER: 'Mijoz'
  }[role] ?? role);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* ── Left: Conversation List ── */}
      <aside className="w-[280px] flex flex-col border-r flex-shrink-0"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        {/* Header */}
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Xabarlar</h2>
            <div className="flex items-center gap-1.5">
              {connected
                ? <><Wifi size={12} className="text-green-400" /><span className="text-[11px] text-green-400">Ulangan</span></>
                : <><WifiOff size={12} className="text-red-400" /><span className="text-[11px] text-red-400">Uzildi</span></>
              }
            </div>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input pl-9 py-2 text-sm" placeholder="Qidirish…"
              value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Suhbatlar yo'q</p>
            </div>
          )}
          {filtered.map(conv => (
            <div key={conv.user_id}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b"
              style={{
                borderColor: 'var(--border)',
                background: activePeer?.user_id === conv.user_id ? 'rgba(99,102,241,0.08)' : '',
                borderLeft: activePeer?.user_id === conv.user_id ? '2px solid var(--brand)' : '2px solid transparent',
              }}
              onClick={() => openConversation(conv)}>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm">
                  {conv.username[0].toUpperCase()}
                </div>
                {conv.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: 'var(--brand)' }}>
                    {conv.unread}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {conv.username}
                  </p>
                  <p className="text-[10px] flex-shrink-0 ml-1" style={{ color: 'var(--text-muted)' }}>
                    {conv.timestamp ? fmt(conv.timestamp) : ''}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[12px] truncate" style={{ color: 'var(--text-muted)' }}>{conv.last_message}</p>
                  <span className="badge badge-active text-[9px] px-1.5 py-0.5 flex-shrink-0"
                    style={{ fontSize: '9px' }}>{getRoleLabel(conv.role)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Right: Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {activePeer ? (
          <>
            {/* Chat header */}
            <div className="h-14 flex items-center px-5 gap-3 border-b glass flex-shrink-0"
              style={{ borderColor: 'var(--border)' }}>
              <div className="relative">
                <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm">
                  {activePeer.username[0].toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full border"
                  style={{ background: 'var(--success)', borderColor: 'var(--bg-surface)' }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {activePeer.username}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {getRoleLabel(activePeer.role)}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg"><Phone size={14} /></button>
                <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg"><Video size={14} /></button>
                <button className="btn btn-ghost w-8 h-8 p-0 rounded-lg"><MoreHorizontal size={14} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Xabar yo'q. Birinchi xabarni yuboring!</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((m, i) => {
                  const me = isMe(m);
                  const prevMe = i > 0 ? isMe(messages[i - 1]) : !me;
                  const grouped = prevMe === me;
                  return (
                    <motion.div key={m.id}
                      className={`flex ${me ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-0.5' : 'mt-4'}`}
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
                      {!me && !grouped && (
                        <div className="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end brand-gradient flex items-center justify-center text-white text-[10px] font-bold">
                          {m.sender[0].toUpperCase()}
                        </div>
                      )}
                      {!me && grouped && <div className="w-7 mr-2 flex-shrink-0" />}
                      <div className="px-3.5 py-2 max-w-[68%] text-[14px] leading-relaxed"
                        style={{
                          background: me ? 'var(--brand)' : 'var(--bg-elevated)',
                          color: me ? '#fff' : 'var(--text-primary)',
                          borderRadius: me ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          boxShadow: me ? '0 2px 12px rgba(99,102,241,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
                        }}>
                        {m.message}
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span style={{ fontSize: '10px', opacity: 0.6 }}>
                            {m.timestamp ? fmt(m.timestamp) : ''}
                          </span>
                          {me && <CheckCheck size={11} style={{ opacity: 0.6 }} />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage}
              className="flex items-center gap-3 px-5 py-3 border-t glass"
              style={{ borderColor: 'var(--border)' }}>
              <input className="input flex-1 py-2.5" placeholder="Xabar yozing…"
                value={newMessage} onChange={e => setNewMessage(e.target.value)} />
              <motion.button type="submit"
                className="btn btn-primary w-10 h-10 p-0 rounded-xl flex-shrink-0"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                disabled={!newMessage.trim() || !connected}
                style={{ opacity: newMessage.trim() && connected ? 1 : 0.4 }}>
                <Send size={16} />
              </motion.button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center"
              style={{ opacity: 0.4 }}>
              <Send size={28} color="white" />
            </div>
            <p className="font-medium text-[15px]" style={{ color: 'var(--text-muted)' }}>
              Suhbat tanlang
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Chap paneldan suhbat bosing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
