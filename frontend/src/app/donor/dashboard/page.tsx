'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeDonations: 0,
    pendingRequests: 0,
    completedDonations: 0
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // These endpoints will need to be implemented/refined in the backend
        const [statsRes, donationsRes] = await Promise.all([
          api.get('/donor/stats'),
          api.get('/donor/donations/recent')
        ]);
        setStats(statsRes.data);
        setRecentDonations(donationsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ icon: Icon, title, value, colorClass }: any) => (
    <div className="card flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-heading uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-gray-900">Welcome back, {user?.firstName}!</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your donations today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Package} 
          title="Active Donations" 
          value={stats.activeDonations} 
          colorClass="bg-primary-light text-primary"
        />
        <StatCard 
          icon={Clock} 
          title="Pending Requests" 
          value={stats.pendingRequests} 
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard 
          icon={CheckCircle} 
          title="Completed" 
          value={stats.completedDonations} 
          colorClass="bg-green-100 text-green-600"
        />
      </div>

      {/* Recent Donations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-gray-900">Recent Donations</h2>
          <Link href="/donor/posts" className="text-primary hover:text-primary-hover font-heading text-sm font-medium">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : recentDonations.length > 0 ? (
          <div className="overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">Food Item</th>
                  <th className="px-6 py-3 text-left text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-heading font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentDonations.map((donation: any) => (
                  <tr key={donation._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{donation.title}</div>
                      <div className="text-xs text-gray-500">{donation.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-heading rounded-full ${
                        donation.status === 'Available' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                      }`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/donor/posts/${donation._id}`} className="text-primary hover:text-primary-hover font-heading">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No donations posted yet.</p>
            <Link href="/donor/posts/new" className="mt-4 inline-block btn-primary">
              Post your first donation
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
