'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Calendar, MapPin, Tag, User, Utensils, Phone, Mail, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

interface FoodDetail {
    _id: string;
    name: string;
    quantity: string;
    description: string;
    pickupLocation: string;
    expiryDate: string;
    dietaryTags: string[];
    contactMethod: string;
    imageUrl?: string;
    status: 'available' | 'claimed';
    donor: {
        firstName: string;
        lastName: string;
        organization?: string;
        phone?: string;
        email: string;
    };
}

export default function FoodDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [food, setFood] = useState<FoodDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);

    useEffect(() => {
        const fetchFood = async () => {
            try {
                const res = await api.get(`/food/${id}`);
                setFood(res.data);
            } catch (err) {
                console.error('Failed to fetch food details');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchFood();
    }, [id]);

    const handleClaim = async () => {
        if (!confirm('Are you sure you want to claim this food?')) return;

        setClaiming(true);
        try {
            await api.post(`/food/claim/${id}`);
            alert('Food claimed successfully!');
            router.push('/profile');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to claim food');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-grow flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!food) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-grow flex flex-col justify-center items-center py-20">
                    <h2 className="text-2xl font-bold text-gray-900">Food listing not found</h2>
                    <Link href="/" className="mt-4 text-orange-600 hover:underline">Return to home</Link>
                </div>
                <Footer />
            </div>
        );
    }

    const isExpired = new Date(food.expiryDate) < new Date();
    const timeLeft = () => {
        const diff = new Date(food.expiryDate).getTime() - new Date().getTime();
        if (diff <= 0) return 'Expired';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center text-gray-600 hover:text-orange-600 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to listings
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Left: Image */}
                        <div className="h-64 md:h-full bg-orange-50 border-r border-gray-100 flex items-center justify-center overflow-hidden">
                            {food.imageUrl ? (
                                <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                            ) : (
                                <Utensils className="h-20 w-20 text-orange-200" />
                            )}
                        </div>

                        {/* Right: Info */}
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">{food.name}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${food.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {food.status === 'available' ? 'Available' : 'Claimed'}
                                </span>
                            </div>

                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {food.description}
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center text-gray-700">
                                    <Tag className="h-5 w-5 mr-3 text-orange-500" />
                                    <span className="font-medium">Quantity:</span>
                                    <span className="ml-2">{food.quantity}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <MapPin className="h-5 w-5 mr-3 text-orange-500" />
                                    <span className="font-medium">Pickup:</span>
                                    <span className="ml-2">{food.pickupLocation}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <Clock className="h-5 w-5 mr-3 text-orange-500" />
                                    <span className="font-medium">Expires in:</span>
                                    <span className={`ml-2 font-bold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                                        {timeLeft()}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-8">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Posted By</h3>
                                <div className="flex items-center mb-4">
                                    <div className="bg-orange-100 p-2 rounded-full mr-3 text-orange-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">
                                            {food.donor.organization || `${food.donor.firstName} ${food.donor.lastName}`}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-8">
                                    <div className="flex items-center text-gray-600">
                                        <Phone className="h-4 w-4 mr-2" />
                                        <span>{food.donor.phone || 'No phone provided'}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Mail className="h-4 w-4 mr-2" />
                                        <span>{food.donor.email}</span>
                                    </div>
                                    <div className="mt-2 text-sm bg-orange-50 text-orange-800 p-3 rounded-lg flex items-start">
                                        <span className="font-bold mr-2">Contact via:</span>
                                        {food.contactMethod}
                                    </div>
                                </div>

                                {user?.role === 'receiver' && food.status === 'available' && !isExpired && (
                                    <button
                                        onClick={handleClaim}
                                        disabled={claiming}
                                        className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        {claiming ? 'Processing...' : 'Claim This Food'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
