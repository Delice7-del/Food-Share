'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import ChatOverlay from '@/components/ChatOverlay';
import { 
  User, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Check, 
  X, 
  Loader2, 
  ChevronRight,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export default function DonorRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<{id: string, name: string} | null>(null);

  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/donor/requests');
      setRequests(res.data);
    } catch (err: any) {
      console.error('Failed to fetch requests', err);
      setError(err.response?.data?.message || 'Failed to load requests. Please ensure you are logged in as a Donor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, status: 'Accepted' | 'Rejected') => {
    setProcessingId(id);
    try {
      await api.patch(`/donor/requests/${id}`, { status });
      setRequests(requests.map((req: any) => 
        req._id === id ? { ...req, status } : req
      ));
    } catch (err) {
      console.error(`Failed to ${status} request`, err);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Accepted': return <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={16} /> Accepted</span>;
      case 'Rejected': return <span className="flex items-center gap-1 text-red-600"><XCircle size={16} /> Rejected</span>;
      default: return <span className="flex items-center gap-1 text-amber-600"><Clock size={16} /> Pending</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
          Incoming <span className="text-primary">Requests</span>
        </h1>
        <p className="text-gray-500 mt-1">Manage requests from receivers who need your food items.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-gray-100" />)}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 rounded-[3rem] border border-red-100 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <AlertCircle className="text-red-500" size={40} />
          </div>
          <h3 className="text-xl font-heading font-extrabold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-red-600 font-medium px-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-8 py-3 bg-white text-gray-900 rounded-xl font-heading font-bold shadow-sm hover:shadow-md transition-all"
          >
            Refresh Page
          </button>
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-6">
          {requests.map((request: any) => (
            <div key={request._id} className="card p-8 flex flex-col md:flex-row items-center gap-8 hover:border-primary/20 transition-all group relative overflow-hidden">
              {/* Status Indicator */}
              <div className={`absolute top-0 left-0 w-1 h-full ${
                request.status === 'Accepted' ? 'bg-green-500' : 
                request.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'
              }`} />

              {/* Receiver Info */}
              <div className="flex items-center gap-4 w-full md:w-64 shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-colors">
                  <User size={28} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-heading font-bold text-gray-900 truncate">
                    {request.receiverId?.firstName} {request.receiverId?.lastName}
                  </h4>
                  <p className="text-xs text-gray-400 truncate">{request.receiverId?.organization || 'Individual Receiver'}</p>
                </div>
              </div>

              {/* Request Details */}
              <div className="flex-grow flex flex-col md:flex-row md:items-center gap-8 w-full">
                <div className="min-w-0 flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={16} className="text-primary" />
                    <span className="text-sm font-heading font-bold text-gray-700 truncate">
                        {request.donationId?.title || request.donationId?.name || 'Requested Item'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 italic">
                    "{request.message || 'No message provided.'}"
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <div className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-gray-300 mb-2">
                    Request Status
                  </div>
                  <div className="font-heading font-bold text-sm">
                    {getStatusDisplay(request.status)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 shrink-0 w-full md:w-auto">
                {request.status === 'Pending' ? (
                  <>
                    <button
                      onClick={() => handleAction(request._id, 'Rejected')}
                      disabled={!!processingId}
                      className="flex-1 md:flex-none p-3 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Reject Request"
                    >
                      {processingId === request._id ? <Loader2 size={20} className="animate-spin" /> : <X size={20} />}
                    </button>
                    <button
                      onClick={() => handleAction(request._id, 'Accepted')}
                      disabled={!!processingId}
                      className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-500/10 font-heading font-bold text-sm"
                    >
                      {processingId === request._id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                      <span>Accept</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    {request.status === 'Accepted' && (
                      <button 
                        onClick={() => setActiveChat({ id: request._id, name: `${request.receiverId?.firstName} ${request.receiverId?.lastName}` })}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-gray-900 hover:scale-105 transition-all shadow-lg shadow-primary/10 font-heading font-bold text-sm"
                      >
                        <MessageSquare size={18} />
                        <span>Chat</span>
                      </button>
                    )}
                    <button 
                      className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"
                      title="View Details"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-amber-500" size={40} />
          </div>
          <h3 className="text-xl font-heading font-extrabold text-gray-900 mb-2">No Requests Yet</h3>
          <p className="text-gray-500">When receivers request your food, they will appear here.</p>
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
