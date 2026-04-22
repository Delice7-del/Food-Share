'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { ShoppingBag, Clock, CheckCircle, XCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ReceiverDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-extrabold text-gray-900">Your Food Requests</h1>
          <p className="text-gray-500 mt-1">Track the status of the food items you've requested.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request: any) => (
              <div key={request._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-gray-900">{request.donationId.title}</h3>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <MapPin size={12} className="mr-1" />
                      {request.donationId.location}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-heading font-medium ${
                    request.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                    request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {request.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Requested on:</span>
                    <span className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-medium">{request.donationId.quantity}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link 
                    href={`/food/${request.donationId._id}`}
                    className="flex-grow text-center py-2 text-sm font-heading font-medium text-gray-600 hover:text-primary border border-gray-100 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Details
                  </Link>
                  <Link 
                    href={`/chat/${request._id}`}
                    className="flex-grow text-center py-2 text-sm font-heading font-bold text-primary border border-primary-light rounded-xl hover:bg-primary-light transition-all"
                  >
                    Chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">You haven't made any requests yet.</p>
            <Link href="/" className="mt-4 inline-block btn-primary">
              Browse Available Food
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
