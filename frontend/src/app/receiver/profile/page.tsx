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
  Camera
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    organization: user?.organization || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await api.put('/users/profile', formData);
      setUser(res.data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-gray-500 mt-1">Manage your account settings and organization details.</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-red-50 text-red-600 font-heading font-bold text-sm hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-primary/10 -z-0" />
            <div className="relative pt-8 pb-4">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-primary text-3xl font-heading font-extrabold mx-auto mb-4">
                  {user?.firstName?.[0]?.toUpperCase()}
                </div>
                <button className="absolute bottom-4 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-hover transition-colors border-2 border-white">
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                <ShieldCheck size={14} className="text-primary" />
                Verified Receiver
              </p>
            </div>
            
            <div className="border-t border-gray-50 mt-6 pt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-400 font-heading uppercase tracking-widest">Joined</p>
                <p className="text-sm font-bold text-gray-700">Apr 2024</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-heading uppercase tracking-widest">Role</p>
                <p className="text-sm font-bold text-gray-700">Receiver</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-heading font-bold text-gray-900">Personal Information</h2>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-primary font-bold hover:underline"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message.text && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {message.type === 'success' ? <ShieldCheck size={18} /> : <MapPin size={18} />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest">First Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input-field pl-12 ${!isEditing ? 'bg-gray-50 border-transparent text-gray-500' : ''}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest">Last Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input-field pl-12 ${!isEditing ? 'bg-gray-50 border-transparent text-gray-500' : ''}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-field pl-12 ${!isEditing ? 'bg-gray-50 border-transparent text-gray-500' : ''}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest">Organization Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input-field pl-12 ${!isEditing ? 'bg-gray-50 border-transparent text-gray-500' : ''}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input-field pl-12 ${!isEditing ? 'bg-gray-50 border-transparent text-gray-500' : ''}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`input-field pl-12 ${!isEditing ? 'bg-gray-50 border-transparent text-gray-500' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 pt-4 border-t border-gray-50 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 px-6 rounded-2xl font-heading font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] btn-primary flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="card mt-8 border-l-4 border-l-amber-500 bg-amber-50/30">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-gray-900">Security</h3>
                <p className="text-sm text-gray-600 mt-1">Want to change your password? Keep your account secure by updating it regularly.</p>
                <button className="mt-4 text-sm font-heading font-bold text-amber-600 hover:underline">
                    Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
