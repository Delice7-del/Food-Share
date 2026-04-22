'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Check, X, MessageSquare, Clock, User, Utensils } from 'lucide-react';
import Link from 'next/link';

export default function DonorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donor/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (requestId: string, status: 'Accepted' | 'Rejected') => {
    setProcessingId(requestId);
    try {
      await api.patch(`/donor/requests/${requestId}`, { status });
      setRequests((prev: any) => 
        prev.map((r: any) => r._id === requestId ? { ...r, status } : r)
      );
    } catch (err) {
      alert('Failed to update request status');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-gray-900">Incoming Requests</h1>
        <p className="text-gray-500 mt-1">Review and manage requests from receivers.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request: any) => (
            <div key={request._id} className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-light p-3 rounded-2xl text-primary shrink-0">
                    <Utensils size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-gray-900">{request.donationId.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                      <span className="flex items-center">
                        <User size={14} className="mr-1" />
                        {request.receiverId.organization || `${request.receiverId.firstName} ${request.receiverId.lastName}`}
                      </span>
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {request.message && (
                      <div className="mt-3 flex items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <MessageSquare size={14} className="mr-2 text-gray-400 mt-1 shrink-0" />
                        <p className="text-sm text-gray-600 italic">"{request.message}"</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-3 shrink-0">
                  {request.status === 'Pending' ? (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                        disabled={!!processingId}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-heading font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
                      >
                        <X size={16} />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request._id, 'Accepted')}
                        disabled={!!processingId}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-heading font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                      >
                        <Check size={16} />
                        <span>Accept</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className={`px-4 py-2 rounded-xl text-sm font-heading font-bold ${
                        request.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {request.status}
                      </span>
                      {request.status === 'Accepted' && (
                        <Link
                          href={`/chat/${request._id}`}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-heading font-bold text-primary border border-primary-light rounded-xl hover:bg-primary-light transition-all"
                        >
                          <MessageSquare size={16} />
                          <span>Chat</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No incoming requests yet.</p>
        </div>
      )}
    </div>
  );
}
