'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import api from '@/services/api';
import { Send, X, MessageSquare, Loader2, User } from 'lucide-react';

interface ChatProps {
  requestId: string;
  recipientName: string;
  onClose: () => void;
}

export default function ChatOverlay({ requestId, recipientName, onClose }: ChatProps) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${requestId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    if (socket) {
      socket.on('new_message', (data: any) => {
        if (data.requestId === requestId) {
          setMessages(prev => [...prev, data.message]);
        }
      });
    }

    return () => {
      if (socket) socket.off('new_message');
    };
  }, [requestId, socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await api.post('/messages', {
        requestId,
        text: newMessage
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col z-[9999] overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="p-6 bg-primary text-gray-900 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm truncate max-w-[150px]">{recipientName}</h3>
            <p className="text-[10px] uppercase font-heading font-bold opacity-70 tracking-widest">Coordinating Pickup</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-black/5 rounded-xl transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/50"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, i) => {
            const isMe = msg.sender._id === user?.id || msg.sender === user?.id;
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  isMe 
                    ? 'bg-primary text-gray-900 rounded-br-none shadow-md shadow-primary/10' 
                    : 'bg-white text-gray-700 rounded-bl-none shadow-sm border border-gray-100'
                }`}>
                  {msg.text}
                  <div className={`text-[10px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
            <MessageSquare size={48} className="mb-4" />
            <p className="text-sm font-heading font-bold">Start a conversation to coordinate your pickup!</p>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-50 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
        />
        <button 
          type="submit"
          disabled={!newMessage.trim()}
          className="p-3 bg-primary text-gray-900 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:scale-100"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
