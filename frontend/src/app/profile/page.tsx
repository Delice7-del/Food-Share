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
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Organization (Optional)</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
                                        value={editForm.organization}
                                        onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                                    />
                                </div>
                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="submit"
                                        className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
                                <div className="h-24 w-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                    <User size={48} />
                                </div>
                                <div className="flex-grow text-center md:text-left">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h1>
                                            <p className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 uppercase tracking-wide">
                                                {user?.role}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="mt-4 md:mt-0 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                                        >
                                            Edit Profile
                                        </button>
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center text-gray-600 font-medium">
                                            <Mail size={18} className="mr-2" />
                                            <span>{user?.email}</span>
                                        </div>
                                        {user?.organization && (
                                            <div className="flex items-center text-gray-600 font-medium">
                                                <Building size={18} className="mr-2" />
                                                <span>{user?.organization}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Listings/Claims */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <Package size={24} className="mr-2 text-orange-600" />
                            {user?.role === 'donor' ? 'My Food Listings' : 'My Claimed Food'}
                        </h2>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
