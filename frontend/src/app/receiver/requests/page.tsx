'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import ChatOverlay from '@/components/ChatOverlay';
import { ShoppingBag, MapPin, Calendar, Clock, MessageSquare, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function MyRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    if (user) {
      const fetchRequests = async () => {
        try {
          const res = await api.get('/receiver/requests');
          setRequests(res.data);
        } catch (err) {
          console.error('Failed to fetch requests');
        } finally {
          setLoading(false);
        }
      };
      fetchRequests();
    }
  }, [user]);

  if (authLoading) return null;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-gray-900">My <span className="text-primary">Food Requests</span></h1>
        <p className="text-gray-500 mt-1">Track and manage your requests for food donations.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request: any) => (
            <div key={request._id} className="card group flex flex-col h-full hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-heading font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                    {request.donationId?.title || 'Food Item'}
                  </h3>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <MapPin size={12} className="mr-1 shrink-0" />
                    <span className="truncate">
                      {request.donationId?.location?.address?.city 
                        ? `${request.donationId.location.address.city}, ${request.donationId.location.address.state || ''}` 
                        : (typeof request.donationId?.location?.address === 'string' ? request.donationId.location.address : 'Unknown Location')}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-heading font-extrabold uppercase tracking-wider shrink-0 ${
                  request.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                  request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-primary-light/20 text-primary'
                }`}>
                  {request.status}
                </span>
              </div>

              <div className="space-y-3 mb-6 flex-grow">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Calendar size={14} /> Requested:
                  </span>
                  <span className="font-medium text-gray-700">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Clock size={14} /> Quantity:
                  </span>
                  <span className="font-medium text-gray-700">
                    {typeof request.donationId?.quantity === 'object' 
                      ? `${request.donationId.quantity.amount} ${request.donationId.quantity.unit}` 
                      : (request.donationId?.quantity || 'N/A')}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mt-4">
                    <span className="text-[10px] text-gray-400 font-heading uppercase tracking-widest">Donor</span>
                    <p className="text-sm font-medium text-gray-800">
                        {request.donorId?.organization || `${request.donorId?.firstName} ${request.donorId?.lastName}`}
                    </p>
                </div>
              </div>

              <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                <Link 
                  href={`/receiver/browse`}
                  className="flex-1 text-center py-2.5 text-xs font-heading font-bold text-gray-600 hover:text-gray-900 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  View Post
                </Link>
                {request.status === 'Accepted' && (
                  <button 
                    onClick={() => setActiveChat({ id: request._id, name: request.donorId?.organization || `${request.donorId?.firstName} ${request.donorId?.lastName}` })}
                    className="flex-[1.5] text-center py-2.5 text-xs font-heading font-bold text-gray-900 bg-primary rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={14} />
                    Chat with Donor
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No requests yet</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Browse available food donations and start making requests to help your community.
          </p>
          <Link href="/receiver/browse" className="btn-primary inline-flex items-center gap-2">
            Browse Available Food
            <ChevronRight size={18} />
          </Link>
        </div>
      )}

      {activeChat && (
        <ChatOverlay 
          requestId={activeChat.id}
          recipientName={activeChat.name}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
