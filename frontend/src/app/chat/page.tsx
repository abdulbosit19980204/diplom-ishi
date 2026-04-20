'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Cookies from 'js-cookie';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { username } = useAuthStore();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initial fetch of message history
    api.get('chat/').then(res => setMessages(res.data)).catch(err => console.error(err));

    // Connect to WebSocket
    const token = Cookies.get('token');
    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}`);
    
    ws.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      // Append real-time message to state
      setMessages((prev: any) => {
        // Simple check to prevent duplicates if listening to own echo
        return [...prev, { id: Date.now(), sender_name: data.sender, content: data.message }];
      });
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Send over websocket instead of REST if connected
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message: newMessage, receiver_id: 1 }));
      setNewMessage('');
    } else {
      console.error("WebSocket is not connected");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-8 items-center">
      <div className="w-full max-w-3xl flex-1 bg-white rounded-xl shadow flex flex-col overflow-hidden">
        <div className="p-4 bg-purple-600 text-white font-bold text-center text-lg">
          Support Chat
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.sender_name === username ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-2xl max-w-xs ${m.sender_name === username ? 'bg-purple-600 text-white' : 'bg-gray-200 text-black'}`}>
                <p className="text-xs opacity-75 mb-1">{m.sender_name}</p>
                <p>{m.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-100 border-t">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input 
              type="text" 
              className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-purple-500 text-black"
              placeholder="Type a message..."
              value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold hover:bg-purple-700 transition">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
