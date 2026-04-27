'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { 
  PlusCircle, 
  Package, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeDonations: 0,
    pendingRequests: 0,
    completedDonations: 0
  });
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          api.get('/donor/stats'),
          api.get('/donor/donations/recent')
        ]);
        setStats(statsRes.data);
        setRecentDonations(recentRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Active Donations', value: stats.activeDonations, icon: Package, color: 'bg-blue-500', light: 'bg-blue-50' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: MessageSquare, color: 'bg-amber-500', light: 'bg-amber-50' },
    { label: 'Completed', value: stats.completedDonations, icon: CheckCircle, color: 'bg-green-500', light: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-gray-900">
            Welcome back, <span className="text-primary">{user?.firstName || 'Donor'}</span>!
          </h1>
          <p className="text-gray-500 mt-1">Thank you for sharing surplus food with your community.</p>
        </div>
        <Link href="/donor/post-donation" className="btn-primary flex items-center justify-center gap-2 group">
          <PlusCircle size={18} />
          <span>Post New Donation</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="card p-6 flex items-center gap-4 group hover:border-primary/20 transition-all">
            <div className={`w-14 h-14 rounded-2xl ${stat.light} flex items-center justify-center text-gray-900 group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} className={stat.color.replace('bg-', 'text-')} />
            </div>
            <div>
              <div className="text-2xl font-heading font-extrabold text-gray-900">{stat.value}</div>
              <div className="text-xs font-heading font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Donations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-gray-900">Recent Donations</h2>
            <Link href="/donor/my-donations" className="text-sm font-heading font-bold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)
            ) : recentDonations.length > 0 ? (
              recentDonations.map((donation: any) => (
                <div key={donation._id} className="card p-4 flex items-center gap-4 hover:border-primary/20 transition-all">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                    {donation.imageUrl ? (
                      <img src={donation.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="text-gray-200" size={24} />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-heading font-bold text-gray-900 truncate">{donation.title || donation.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(donation.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-heading font-bold ${
                        donation.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
                      }`}>
                        {donation.status}
                      </span>
                    </div>
                  </div>
                  <Link href={`/donor/my-donations`} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
                    <ArrowRight size={20} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                <Package className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-heading">No donations yet.</p>
                <Link href="/donor/post-donation" className="text-primary font-heading font-bold mt-2 inline-block">
                  Create your first listing
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips / Actions */}
        <div className="space-y-6">
          <div className="bg-primary-light rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <h3 className="text-xl font-heading font-extrabold text-primary mb-4 leading-tight">
              Ready to help <br/> others?
            </h3>
            <p className="text-primary/70 text-sm mb-6 leading-relaxed">
              Posting a donation only takes a minute. Make sure to include clear photos!
            </p>
            <Link href="/donor/post-donation" className="btn-primary w-full text-center py-3 text-sm">
              Get Started
            </Link>
          </div>

          <div className="card p-6">
            <h3 className="font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-primary" size={18} />
              Donor Tip
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Donations with precise pickup locations and expiry dates get requested 40% faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
