'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Send, ArrowLeft, User, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ChatPage() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchData = async () => {
    try {
      // For simplicity, we get request details from the message query or a separate call
      // Here we assume a route to get request details or we just handle it
      const [msgRes, reqRes] = await Promise.all([
        api.get(`/messages/${requestId}`),
        api.get(`/receiver/requests`) // This might need a specific get by ID route
      ]);
      
      setMessages(msgRes.data);
      // Find the specific request from the list for now
      const currentReq = reqRes.data.find((r: any) => r._id === requestId);
      setRequest(currentReq);
    } catch (err) {
      console.error('Failed to fetch chat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Simple polling for "realtime"
    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(scrollToBottom, [messages]);

  const [sending, setSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await api.post('/messages', {
        requestId,
        text: newMessage
      });
      setMessages([...messages, res.data] as any);
      setNewMessage('');
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 flex flex-col">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-primary mb-6 font-heading font-bold text-sm"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </button>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
          {/* Header */}
          <div className="p-6 border-b border-gray-50 bg-primary-light/20 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary-light p-3 rounded-2xl mr-4 text-primary">
                <User size={24} />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-xl text-gray-900">
                   Chat with {user?.role === 'donor' ? 'Receiver' : 'Donor'}
                </h2>
                <p className="text-xs text-gray-500 font-heading font-bold uppercase tracking-widest">
                  Request for {request?.donationId?.name || 'Food'}
                </p>
              </div>
            </div>
            <div className={`px-4 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${
              request?.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-primary-light text-primary-hover'
            }`}>
              {request?.status}
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-gray-50/30">
            {messages.map((msg: any) => (
              <div 
                key={msg._id} 
                className={`flex ${msg.sender._id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] rounded-3xl px-6 py-4 shadow-sm ${
                  msg.sender._id === user?.id 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white text-gray-900 border border-gray-100 rounded-bl-none'
                }`}>
                  <p className="font-body leading-relaxed">{msg.text}</p>
                  <div className={`text-[10px] mt-2 font-heading font-bold uppercase tracking-widest ${
                    msg.sender._id === user?.id ? 'text-primary-light' : 'text-gray-400'
                  }`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-50 flex items-center space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-grow input-field py-4"
            />
            <button
              type="submit"
              disabled={sending}
              className={`bg-primary text-white p-4 rounded-2xl transition-all shadow-lg shadow-primary-light ${
                sending ? 'opacity-50 scale-95' : 'hover:bg-primary-hover hover:scale-105'
              }`}
            >
              {sending ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <Send size={24} />
              )}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
