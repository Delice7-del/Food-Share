'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { 
  User as UserIcon, 
  Mail, 
  Building2, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Save,
  LogOut,
  Camera,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function DonorProfilePage() {
  const { user, logout, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    address: user?.address || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const res = await api.put('/users/profile', formData);
      setUser(res.data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
            Account <span className="text-primary">Settings</span>
          </h1>
          <p className="text-gray-500 mt-1">Manage your personal information and preferences.</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-heading font-bold text-sm"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card p-8 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-4xl shadow-inner">
                {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
              </div>
              <button className="absolute bottom-0 right-0 p-3 bg-white rounded-2xl shadow-xl border border-gray-100 text-gray-400 hover:text-primary transition-all group-hover:scale-110">
                <Camera size={18} />
              </button>
            </div>
            <h2 className="text-xl font-heading font-extrabold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <div className="mt-1 px-3 py-1 bg-primary-light text-primary text-[10px] font-heading font-extrabold uppercase tracking-widest rounded-full">
              Community Donor
            </div>
            
            <div className="mt-8 w-full space-y-4 pt-8 border-t border-gray-50">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <ShieldCheck size={18} className="text-green-500 shrink-0" />
                <span className="truncate">Verified Account</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Building2 size={18} className="text-primary shrink-0" />
                <span className="truncate">{user?.organization || 'Local Donor'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center gap-2 pb-2 border-b border-gray-50 mb-2">
                <UserIcon className="text-primary" size={20} />
                <h3 className="text-lg font-heading font-bold text-gray-900">Personal Details</h3>
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    className="input-field pl-12 bg-gray-50 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex items-center gap-2 pb-2 border-b border-gray-50 mt-4 mb-2">
                <Building2 className="text-primary" size={20} />
                <h3 className="text-lg font-heading font-bold text-gray-900">Organization Info</h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Organization Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Primary Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field pl-12"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-gray-400 italic">Last updated: Today</p>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-10 flex items-center gap-2 group min-w-[180px] justify-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : success ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <>
                    <Save size={20} className="group-hover:rotate-12 transition-transform" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
