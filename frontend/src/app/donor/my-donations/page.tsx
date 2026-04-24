'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Package, 
  MapPin, 
  Calendar, 
  Clock, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function MyDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchMyDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donations/my');
      setDonations(res.data.data.donations);
    } catch (err) {
      console.error('Failed to fetch my donations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donation?')) return;
    try {
      await api.delete(`/donations/${id}`);
      setDonations(donations.filter((d: any) => d._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete donation. It may have already been reserved or picked up.');
    }
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      await api.put(`/donations/${id}`, { status: 'picked-up' });
      setDonations(donations.map((d: any) => 
        d._id === id ? { ...d, status: 'picked-up' } : d
      ));
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const filteredDonations = donations.filter((d: any) => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-50 text-green-600 border-green-100';
      case 'reserved': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'picked-up': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'expired': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
            My <span className="text-primary">Donations</span>
          </h1>
          <p className="text-gray-500 mt-1">Manage and track all your shared food items.</p>
        </div>
        <Link href="/donor/post-donation" className="btn-primary flex items-center justify-center gap-2">
          <PlusCircle size={18} />
          <span>Post Donation</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search your donations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field pl-12 appearance-none bg-white/50"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="picked-up">Picked Up</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Donations List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-3xl animate-pulse border border-gray-100" />)}
        </div>
      ) : filteredDonations.length > 0 ? (
        <div className="space-y-4">
          {filteredDonations.map((donation: any) => (
            <div key={donation._id} className="card p-6 flex flex-col md:flex-row gap-6 hover:border-primary/20 transition-all group">
              {/* Image */}
              <div className="w-full md:w-40 h-40 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 relative overflow-hidden">
                {donation.imageUrl ? (
                  <img src={donation.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Package className="text-gray-200" size={32} />
                )}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg border text-[10px] font-heading font-extrabold uppercase tracking-wider backdrop-blur-md ${getStatusColor(donation.status)}`}>
                  {donation.status}
                </div>
              </div>

              {/* Info */}
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-heading font-extrabold text-gray-900 mb-2">{donation.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">{donation.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Package size={14} className="text-primary" />
                    <span>{donation.quantity?.amount} {donation.quantity?.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin size={14} className="text-primary" />
                    <span className="truncate max-w-[120px]">{donation.location?.address?.street || 'Local'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar size={14} className="text-primary" />
                    <span>{new Date(donation.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={14} className="text-primary" />
                    <span>Expires in {Math.max(0, Math.ceil((new Date(donation.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}d</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 shrink-0 justify-center">
                {donation.status === 'available' && (
                  <>
                    <button 
                      onClick={() => handleMarkCompleted(donation._id)}
                      className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                      title="Mark as Picked Up"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button 
                      className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                      title="Edit Donation"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(donation._id)}
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                      title="Delete Donation"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                {donation.status === 'reserved' && (
                   <button 
                   onClick={() => handleMarkCompleted(donation._id)}
                   className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-heading text-xs font-bold"
                 >
                   <CheckCircle size={16} />
                   <span>Mark Picked Up</span>
                 </button>
                )}
                {donation.status === 'picked-up' && (
                  <div className="flex items-center gap-2 text-green-600 font-heading font-bold text-xs">
                    <CheckCircle size={16} />
                    <span>Completed</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-12 w-12 text-gray-200" />
          </div>
          <h3 className="text-2xl font-heading font-extrabold text-gray-900 mb-2">No donations yet</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            You haven't posted any food items yet. Start sharing today and help someone in need!
          </p>
          <Link href="/donor/post-donation" className="btn-primary px-10">
            Post Your First Donation
          </Link>
        </div>
      )}
    </div>
  );
}
