'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FoodCard from '@/components/FoodCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { User, Package, MapPin, Phone, Mail, Building, Clock, Tag, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const ProfilePage = () => {
    const { user, checkAuth } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        organization: user?.organization || '',
    });

    useEffect(() => {
        if (user) {
            setEditForm({
                firstName: user.firstName,
                lastName: user.lastName,
                organization: user.organization || '',
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/users/profile', editForm);
            await checkAuth();
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    const fetchMyData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (user?.role === 'donor') {
                // Fetch donor's donations
                const res = await api.get('/donations/my');
                setItems(res.data.data?.donations || []);
            } else {
                // Fetch receiver's requests
                const res = await api.get('/receiver/requests');
                setItems(res.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch data', err);
            setError('Failed to load your items. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyData();
        }
    }, [user]);

    return (
        <ProtectedRoute>
            <div className="min-h-screen flex flex-col bg-[#F9F7F4]">
                <Navbar />
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                    
                    {/* User Profile Info */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12 mb-12 animate-fade-in">
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest ml-1">Organization (Optional)</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={editForm.organization}
                                        onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                                    />
                                </div>
                                <div className="flex space-x-4 pt-6">
                                    <button type="submit" className="btn-primary px-8">Save Changes</button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-8 py-2 text-gray-500 font-heading font-bold hover:text-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
                                <div className="h-32 w-32 bg-primary-light rounded-[2.5rem] flex items-center justify-center text-primary shadow-inner">
                                    <User size={64} />
                                </div>
                                <div className="flex-grow text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h1 className="text-4xl font-heading font-extrabold text-gray-900 tracking-tight">{user?.firstName} {user?.lastName}</h1>
                                            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                                                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-heading font-extrabold bg-primary-light text-primary uppercase tracking-widest">
                                                    {user?.role} Account
                                                </span>
                                                <span className="text-gray-400 text-xs font-medium">• Member since 2024</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-white border border-gray-100 text-gray-600 px-8 py-3 rounded-2xl text-sm font-heading font-bold hover:border-primary/20 hover:text-primary transition-all shadow-sm hover:shadow-md cursor-pointer"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>

                                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center text-gray-600 font-medium bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                            <Mail size={20} className="mr-4 text-primary" />
                                            <span>{user?.email}</span>
                                        </div>
                                        {user?.organization && (
                                            <div className="flex items-center text-gray-600 font-medium bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                                <Building size={20} className="mr-4 text-primary" />
                                                <span>{user?.organization}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Listings / Requests Section */}
                    <div className="animate-fade-in delay-100">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-heading font-extrabold text-gray-900 flex items-center">
                                <Package size={28} className="mr-4 text-primary" />
                                {user?.role === 'donor' ? 'My Food Donations' : 'My Requests'}
                            </h2>
                            {user?.role === 'donor' && (
                                <Link href="/donor/add-food" className="text-primary font-heading font-bold hover:underline flex items-center gap-2">
                                    + Add New Donation
                                </Link>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                                <p className="text-gray-500 font-heading font-medium">Loading your items...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 bg-red-50 rounded-[2.5rem] border border-red-100 max-w-2xl mx-auto">
                                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Error Loading Data</h3>
                                <p className="text-red-600 font-medium">{error}</p>
                            </div>
                        ) : items.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {items.map((item: any) => (
                                    <div key={item._id} className="card group flex flex-col h-full hover:border-primary/20 transition-all overflow-hidden">
                                        <div className="h-40 -mx-6 -mt-6 mb-6 bg-primary-light flex items-center justify-center relative overflow-hidden">
                                            {(item.imageUrl || (item.images && item.images[0]?.url)) ? (
                                                <img 
                                                  src={item.imageUrl || item.images[0]?.url} 
                                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                  alt={item.title || item.name}
                                                />
                                            ) : (
                                                <Package className="h-12 w-12 text-primary/30" />
                                            )}
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-heading font-extrabold uppercase tracking-wider text-primary shadow-sm">
                                                {user?.role === 'donor' ? item.status : item.status}
                                            </div>
                                        </div>

                                        <div className="flex-grow">
                                            <h3 className="text-lg font-heading font-bold text-gray-900 truncate mb-2">
                                                {user?.role === 'donor' ? (item.title || item.name) : (item.donationId?.title || 'Food Request')}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                                {user?.role === 'donor' ? item.description : `Request for ${item.donationId?.title || 'item'}`}
                                            </p>

                                            <div className="space-y-2 mb-6">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Tag size={14} className="mr-2 text-primary" />
                                                    <span>
                                                        {user?.role === 'donor' 
                                                          ? `Quantity: ${typeof item.quantity === 'object' ? `${item.quantity.amount} ${item.quantity.unit}` : item.quantity}`
                                                          : `Status: ${item.status}`
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Clock size={14} className="mr-2 text-primary" />
                                                    <span>
                                                        {user?.role === 'donor' 
                                                          ? `Expires: ${new Date(item.expiryDate).toLocaleDateString()}`
                                                          : `Requested: ${new Date(item.createdAt).toLocaleDateString()}`
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-50">
                                            <Link 
                                              href={user?.role === 'donor' ? '/donor/requests' : '/receiver/requests'}
                                              className="btn-primary py-2.5 w-full text-xs flex items-center justify-center gap-2"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Package className="h-10 w-10 text-gray-200" />
                                </div>
                                <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No items found</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                    {user?.role === 'donor'
                                        ? "You haven't posted any food donations yet. Start by adding your first listing!"
                                        : "You haven't made any food requests yet. Browse available food to get started."}
                                </p>
                                <Link 
                                  href={user?.role === 'donor' ? '/donor/add-food' : '/receiver/browse'}
                                  className="btn-primary"
                                >
                                    {user?.role === 'donor' ? 'Post a Donation' : 'Browse Food'}
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </ProtectedRoute>
    );
};

export default ProfilePage;
