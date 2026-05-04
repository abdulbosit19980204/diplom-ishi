'use client';
import { useEffect, useRef, useState, useCallback, Suspense, useMemo, memo } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search, Phone, Video, MoreHorizontal,
  CheckCheck, Check, Circle, Wifi, WifiOff, ArrowLeft, ChevronLeft,
  Paperclip, Loader2, Package
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Message {
  id: number;
  sender: string;
  sender_id: number;
  message: string;
  file?: string;
  file_name?: string;
  is_image?: boolean;
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
  is_online?: boolean;
  last_seen?: string;
}

const MessageBubble = memo(({ m, me, grouped, fmt, getMediaUrl }: { m: Message, me: boolean, grouped: boolean, fmt: any, getMediaUrl: any }) => {
  return (
    <motion.div className={`flex ${me ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-0.5' : 'mt-4'}`} initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
      {!me && !grouped && <div className="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end brand-gradient flex items-center justify-center text-white text-[10px] font-bold shadow-sm">{m.sender[0].toUpperCase()}</div>}
      {!me && grouped && <div className="w-7 mr-2 flex-shrink-0" />}
      <div className="px-3.5 py-2 max-w-[68%] text-[14px] leading-relaxed relative flex flex-col gap-2" 
        style={{ 
          background: me ? 'var(--brand)' : 'var(--bg-elevated)', 
          color: me ? '#fff' : 'var(--text-primary)', 
          borderRadius: me ? (grouped ? '18px 4px 4px 18px' : '18px 18px 4px 18px') : (grouped ? '4px 18px 18px 4px' : '18px 18px 18px 4px'), 
          boxShadow: me ? '0 2px 12px rgba(99,102,241,0.25)' : '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
        {m.order_id && !grouped && (
           <div className={`text-[9px] font-bold uppercase tracking-tighter ${me ? 'text-white/70' : 'text-indigo-400'}`}>
              Buyurtma #{m.order_id}
           </div>
        )}
        {m.is_image && m.file && (
          <div className="rounded-lg overflow-hidden my-1 max-w-full">
            <img src={getMediaUrl(m.file)} alt="Chat image" className="max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(getMediaUrl(m.file), '_blank')} />
          </div>
        )}
        {!m.is_image && m.file && (
          <a href={getMediaUrl(m.file)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded-xl border ${me ? 'bg-white/10 border-white/20' : 'bg-surface border-white/5'} transition-colors hover:bg-opacity-20`}>
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${me ? 'bg-white/20' : 'brand-gradient'}`}>
                <Package size={14} color="white" />
             </div>
             <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold truncate">{m.file_name || 'Fayl'}</p>
                <p className="text-[10px] opacity-60 uppercase font-black tracking-widest">Yuklab olish</p>
             </div>
          </a>
        )}
        {m.message && <p className="whitespace-pre-wrap">{m.message}</p>}
        <div className="flex items-center justify-end gap-1">
          <span style={{ fontSize: '10px', opacity: 0.6 }}>{m.timestamp ? fmt(m.timestamp) : ''}</span>
          {me && <CheckCheck size={11} style={{ opacity: 0.8 }} />}
        </div>
      </div>
    </motion.div>
  );
});

function ChatContent() {
  const { username } = useAuthStore();
  const searchParams = useSearchParams();
  const paramOrderId = searchParams.get('orderId');
  const paramUserId  = searchParams.get('userId');
  const paramName    = searchParams.get('name');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [activePeer, setActivePeer]       = useState<Conversation | null>(null);
  const [activeOrder, setActiveOrder]     = useState<string | null>(paramOrderId);
  const [newMessage, setNewMessage]       = useState('');
  const [connected, setConnected]         = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [searchQ, setSearchQ]             = useState('');
  const [mounted, setMounted]             = useState(false);
  const ws      = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const connect = useCallback(() => {
    const token = Cookies.get('token');
    if (!token) return;
    ws.current?.close();

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || (typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/` : 'ws://localhost:8000/ws/');
    const url = `${wsUrl}chat/?token=${token}${activeOrder ? `&order_id=${activeOrder}` : ''}`;
    const socket = new WebSocket(url);

    socket.onopen  = () => setConnected(true);
    socket.onclose = () => { setConnected(false); setTimeout(connect, 3000); };
    socket.onerror = () => setConnected(false);
    socket.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === 'chat_message') {
        setMessages(prev => {
          if (prev.find(m => m.id === data.id)) return prev;
          
          return [...prev, {
            id: data.id,
            sender: data.sender,
            sender_id: data.sender_id,
            message: data.message,
            file: data.file,
            file_name: data.file_name,
            is_image: data.is_image,
            timestamp: data.timestamp,
            order_id: data.order_id,
          }];
        });
        
        setConversations(prev => {
          const exists = prev.find(c => c.user_id === data.sender_id);
          const preview = data.message || (data.file_name ? `📎 ${data.file_name}` : '[Fayl]');
          
          if (!exists) {
            loadConversations();
            return prev;
          }
          return prev.map(c =>
            c.user_id === data.sender_id || c.user_id === (data.receiver_id || -1)
              ? { ...c, last_message: preview, timestamp: data.timestamp }
              : c
          );
        });
      }
    };
    ws.current = socket;
  }, [activeOrder]);

  const loadConversations = useCallback(async () => {
    try {
      const r = await api.get('chat/conversations/');
      setConversations(r.data);
    } catch {}
  }, []);

  const openConversation = useCallback(async (conv: Conversation) => {
    setActivePeer(conv);
    setMessages([]);
    const url = activeOrder
      ? `chat/?user_id=${conv.user_id}&order_id=${activeOrder}`
      : `chat/?user_id=${conv.user_id}`;

    try {
      const r = await api.get(url);
      setMessages(r.data.map((m: any) => ({
        id: m.id,
        sender: m.sender_name,
        sender_id: m.sender,
        message: m.content,
        file: m.file,
        file_name: m.file_name,
        is_image: m.is_image,
        timestamp: m.timestamp,
        order_id: m.order,
      })));

      await api.post('chat/mark-read/', { user_id: conv.user_id });
      setConversations(prev => prev.map(c => 
        c.user_id === conv.user_id ? { ...c, unread: 0 } : c
      ));
    } catch {}
  }, [activeOrder]);

  useEffect(() => {
    setMounted(true);
    connect();
    loadConversations();
    window.addEventListener('refresh-unread-counts', loadConversations);
    return () => {
        ws.current?.close();
        window.removeEventListener('refresh-unread-counts', loadConversations);
    };
  }, [connect, loadConversations]);

  useEffect(() => {
    if (paramUserId && paramName) {
      const peer = {
        user_id: parseInt(paramUserId),
        username: paramName,
        role: 'CUSTOMER',
        last_message: '',
        timestamp: new Date().toISOString(),
        unread: 0
      };
      openConversation(peer);
    }
  }, [openConversation, paramUserId, paramName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '42px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + 'px';
    }
  }, [newMessage]);

  if (!mounted) return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Yuklanmoqda...</p>
    </div>
  );

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activePeer) return;

    try {
      const formData = new FormData();
      formData.append('content', newMessage.trim());
      formData.append('receiver', String(activePeer.user_id));
      if (activeOrder) formData.append('order', activeOrder);

      await api.post('chat/', formData);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePeer) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiver', String(activePeer.user_id));
      if (activeOrder) formData.append('order', activeOrder);

      await api.post('chat/', formData);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isMe = (msg: Message) => msg.sender === username || msg.sender_id === -1;
  const filtered = conversations.filter(c => c.username.toLowerCase().includes(searchQ.toLowerCase()));
  const getRoleLabel = (role: string) => ({ ADMIN: 'Admin', MANAGER: 'Menejer', CUSTOMER: 'Mijoz' }[role] ?? role);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' });
  };

  const getStatusText = (conv: Conversation | null) => {
    if (!conv) return '';
    if (conv.is_online) return 'onlayn';
    if (!conv.last_seen) return 'yaqinda ko\'rilgan';
    const d = new Date(conv.last_seen);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'hozirgina';
    if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
    if (d.toDateString() === now.toDateString()) {
      return `bugun ${d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}da`;
    }
    return `${d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })}da ko'rilgan`;
  };

  const getMediaUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
    const rootBase = apiBase.replace(/\/api\/?$/, '');
    return `${rootBase}${url}`;
  };

  return (
    <div className="flex h-full overflow-hidden relative" style={{ background: 'var(--bg-base)' }}>
      <aside className={`${activePeer ? 'hidden md:flex' : 'flex'} w-full md:w-[280px] flex flex-col border-r flex-shrink-0`} style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Xabarlar</h2>
            <div className="flex items-center gap-1.5">
              {connected ? <><Wifi size={12} className="text-green-400" /><span className="text-[11px] text-green-400">Ulangan</span></> : <><WifiOff size={12} className="text-red-400" /><span className="text-[11px] text-red-400">Uzildi</span></>}
            </div>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input pl-9 py-2 text-sm" placeholder="Qidirish…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && <div className="flex flex-col items-center justify-center h-full py-12"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Suhbatlar yo'q</p></div>}
          {filtered.map(conv => (
            <div key={conv.user_id} className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b" style={{ borderColor: 'var(--border)', background: activePeer?.user_id === conv.user_id ? 'rgba(99,102,241,0.08)' : '', borderLeft: activePeer?.user_id === conv.user_id ? '2px solid var(--brand)' : '2px solid transparent' }} onClick={() => openConversation(conv)}>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm shadow-sm">{conv.username[0].toUpperCase()}</div>
                {conv.is_online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--bg-surface)] bg-green-500" />}
                {conv.unread > 0 && <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg" style={{ background: 'var(--brand)' }}>{conv.unread}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{conv.username}</p>
                  <p className="text-[10px] flex-shrink-0 ml-1" style={{ color: 'var(--text-muted)' }}>{conv.timestamp ? fmt(conv.timestamp) : ''}</p>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[12px] truncate" style={{ color: 'var(--text-muted)' }}>{conv.last_message}</p>
                  <span className="badge badge-active text-[9px] px-1.5 py-0.5 flex-shrink-0">{getRoleLabel(conv.role)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className={`${!activePeer ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col min-w-0 h-full relative z-10`}>
        {activePeer ? (
          <>
            <div className="h-14 flex items-center px-3 md:px-5 gap-2 md:gap-3 border-b glass flex-shrink-0 sticky top-0 z-20" style={{ borderColor: 'var(--border)' }}>
              <button className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-white/5 active:scale-95 transition-all" onClick={() => { setActivePeer(null); window.history.replaceState({}, '', '/chat'); }}>
                <ChevronLeft size={22} style={{ color: 'var(--brand)' }} />
              </button>
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">{activePeer.username[0].toUpperCase()}</div>
                {activePeer.is_online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 bg-green-500" style={{ borderColor: 'var(--bg-surface)' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] md:text-[14px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{activePeer.username}</p>
                  {activeOrder && <span className="badge badge-pending text-[9px] px-1.5 py-0.5 whitespace-nowrap">#{activeOrder}</span>}
                </div>
                <p className={`text-[10px] md:text-[11px] font-medium tracking-wide ${activePeer.is_online ? 'text-green-500' : 'opacity-60'}`}>
                   {getStatusText(activePeer)}
                </p>
              </div>
              <div className="flex items-center gap-0.5 md:gap-1">
                <button className="btn btn-ghost w-8 h-8 md:w-9 md:h-9 p-0 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-500 transition-all"><Phone size={16} /></button>
                <button className="btn btn-ghost w-8 h-8 md:w-9 md:h-9 p-0 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-500 transition-all"><Video size={16} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
              {messages.length === 0 && <div className="flex items-center justify-center h-full"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Xabar yo'q. Birinchi xabarni yuboring!</p></div>}
              <AnimatePresence initial={false}>
                {messages.map((m, i) => {
                  const me = isMe(m);
                  const prevMe = i > 0 ? isMe(messages[i - 1]) : !me;
                  const grouped = prevMe === me;
                  return <MessageBubble key={m.id} m={m} me={me} grouped={grouped} fmt={fmt} getMediaUrl={getMediaUrl} />;
                })}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            <div className="px-5 py-3 border-t glass flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
               {uploading && (
                  <div className="flex items-center gap-2 text-[11px] text-indigo-400 animate-pulse font-bold uppercase tracking-widest px-2">
                     <Loader2 size={12} className="animate-spin" /> Fayl yuklanmoqda...
                  </div>
               )}
               <div className="flex items-end gap-3">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                  <button onClick={() => fileInputRef.current?.click()} className="btn btn-ghost w-10 h-10 p-0 rounded-xl flex-shrink-0" title="Fayl biriktirish">
                     <Paperclip size={18} />
                  </button>
                  <textarea 
                    ref={textareaRef}
                    className="input flex-1 py-2.5 resize-none overflow-y-auto custom-scrollbar leading-tight min-h-[42px] max-h-[150px]" 
                    placeholder="Xabar yozing…" 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <motion.button 
                    onClick={() => sendMessage()}
                    className="btn btn-primary w-10 h-10 p-0 rounded-xl flex-shrink-0 mb-0.5" 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                    disabled={(!newMessage.trim() && !uploading) || !connected} 
                    style={{ opacity: (newMessage.trim() || uploading) && connected ? 1 : 0.4 }}
                  >
                    <Send size={16} />
                  </motion.button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center" style={{ opacity: 0.4 }}><Send size={28} color="white" /></div>
            <p className="font-medium text-[15px]" style={{ color: 'var(--text-muted)' }}>Suhbat tanlang</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chap paneldan suhbat bosing</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Yuklanmoqda...</div>}>
      <ChatContent />
    </Suspense>
  );
}
