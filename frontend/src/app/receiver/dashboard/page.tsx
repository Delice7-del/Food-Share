'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Package,
  Bell
} from 'lucide-react';
import Link from 'next/link';

export default function ReceiverDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
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

  const stats = {
    total: requests.length,
    accepted: requests.filter((r: any) => r.status === 'Accepted').length,
    pending: requests.filter((r: any) => r.status === 'Pending').length,
  };

  const recentActivity = requests.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-gray-900">
            Hello, {user?.firstName || 'Sandra'}! 👋
          </h1>
          <p className="text-gray-700 mt-1 font-medium">Here's what's happening with your food requests today.</p>
        </div>
        <Link href="/receiver/browse" className="btn-primary flex items-center justify-center gap-2 group">
          <span>Browse Available Food</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-l-4 border-l-primary flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-light/10 flex items-center justify-center text-primary">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-700 font-bold">Total Requests</p>
            <p className="text-2xl font-heading font-extrabold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="card border-l-4 border-l-green-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-700 font-bold">Accepted</p>
            <p className="text-2xl font-heading font-extrabold text-gray-900">{stats.accepted}</p>
          </div>
        </div>

        <div className="card border-l-4 border-l-amber-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-700 font-bold">Pending</p>
            <p className="text-2xl font-heading font-extrabold text-gray-900">{stats.pending}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Recent Activity
            </h2>
            <Link href="/receiver/requests" className="text-sm text-primary font-bold hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((request: any) => (
                <div key={request._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      request.status === 'Accepted' ? 'bg-green-100 text-green-600' :
                      request.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                      'bg-primary-light/20 text-primary'
                    }`}>
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-heading font-bold text-gray-900 truncate max-w-[150px]">
                        {request.donationId?.title || 'Food Item'}
                      </p>
                        <p className="text-xs text-gray-600 font-bold">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-heading font-extrabold uppercase tracking-wider ${
                    request.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                    request.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-primary-light/30 text-primary'
                  }`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-200 mb-3" />
              <p className="text-gray-700 text-sm font-medium">No recent activity found.</p>
            </div>
          )}
        </div>

        {/* Quick Tips / Notifications Summary */}
        <div className="card bg-primary/5 border-primary/20">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            Quick Tips
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-primary/10">
              <p className="text-sm font-heading font-bold text-gray-800">Complete your profile</p>
              <p className="text-xs text-gray-500 mt-1">Add your organization details to increase your chances of getting food requests accepted.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-primary/10">
              <p className="text-sm font-heading font-bold text-gray-800">Check the Map View</p>
              <p className="text-xs text-gray-500 mt-1">See food donations near you in real-time to save on transportation costs.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-primary/10">
              <p className="text-sm font-heading font-bold text-gray-800">Be quick!</p>
              <p className="text-xs text-gray-500 mt-1">Popular items get requested fast. Enable notifications to stay updated.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
