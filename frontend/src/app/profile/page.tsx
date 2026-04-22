'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FoodCard from '@/components/FoodCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { User, Package, MapPin, Phone, Mail, Building } from 'lucide-react';

const ProfilePage = () => {
    const { user, checkAuth } = useAuth();
    const [myFoods, setMyFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
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

    const fetchMyFoods = async () => {
        try {
            const res = await api.get('/food/my');
            setMyFoods(res.data);
        } catch (err) {
            console.error('Failed to fetch my foods');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyFoods();
        }
    }, [user]);

    return (
        <ProtectedRoute>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                    {/* User Profile Info */}
                    {/* User Profile Info */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 mb-12">
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-widest ml-1">Organization (Optional)</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={editForm.organization}
                                        onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                                    />
                                </div>
                                <div className="flex space-x-4 pt-6">
                                    <button
                                        type="submit"
                                        className="btn-primary px-8"
                                    >
                                        Save Changes
                                    </button>
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
                            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-10">
                                <div className="h-28 w-28 bg-primary-light rounded-3xl flex items-center justify-center text-primary shadow-inner">
                                    <User size={56} />
                                </div>
                                <div className="flex-grow text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h1 className="text-4xl font-heading font-extrabold text-gray-900 tracking-tight">{user?.firstName} {user?.lastName}</h1>
                                            <span className="inline-flex items-center px-4 py-1.5 mt-3 rounded-full text-xs font-heading font-bold bg-primary-light text-primary-hover uppercase tracking-widest">
                                                {user?.role} Portal
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="mt-6 md:mt-0 bg-white border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-heading font-bold hover:border-primary-light hover:text-primary transition-all shadow-sm"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>

                                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center text-gray-600 font-medium bg-gray-50 p-4 rounded-2xl">
                                            <Mail size={20} className="mr-4 text-primary-light0" />
                                            <span>{user?.email}</span>
                                        </div>
                                        {user?.organization && (
                                            <div className="flex items-center text-gray-600 font-medium bg-gray-50 p-4 rounded-2xl">
                                                <Building size={20} className="mr-4 text-primary-light0" />
                                                <span>{user?.organization}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Listings/Claims */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-heading font-extrabold text-gray-900 mb-8 flex items-center">
                            <Package size={28} className="mr-4 text-primary" />
                            {user?.role === 'donor' ? 'My Food Listings' : 'My Claimed Food'}
                        </h2>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : myFoods.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {myFoods.map((food: any) => (
                                    <FoodCard key={food._id} food={food} onClaim={fetchMyFoods} onDelete={fetchMyFoods} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">
                                    {user?.role === 'donor'
                                        ? "You haven't posted any food listings yet."
                                        : "You haven't claimed any food yet."}
                                </p>
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
