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
    const [requestMessage, setRequestMessage] = useState('');
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

    const handleRequest = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        
        setClaiming(true);
        try {
            await api.post('/receiver/requests', { 
                donationId: id,
                message: requestMessage 
            });
            alert('Request sent successfully! The donor will review it.');
            router.push('/receiver/dashboard');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to send request');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <div className="flex-grow flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                    <h2 className="text-2xl font-heading font-bold text-gray-900">Food listing not found</h2>
                    <Link href="/" className="mt-4 text-primary hover:underline font-heading font-medium">Return to home</Link>
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
            <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center text-gray-500 hover:text-primary transition-colors font-heading text-sm font-medium"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to listings
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left: Image */}
                        <div className="h-[300px] lg:h-auto bg-primary-light flex items-center justify-center overflow-hidden">
                            {food.imageUrl ? (
                                <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                            ) : (
                                <Utensils className="h-24 w-24 text-primary-light" />
                            )}
                        </div>

                        {/* Right: Info */}
                        <div className="p-10 lg:p-12">
                            <div className="flex justify-between items-start mb-6">
                                <h1 className="text-4xl font-heading font-extrabold text-gray-900 leading-tight">{food.name}</h1>
                                <span className={`px-4 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${food.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {food.status === 'available' ? 'Available' : 'Claimed'}
                                </span>
                            </div>

                            <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                                {food.description}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                                <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-2xl">
                                    <Tag className="h-6 w-6 mr-4 text-primary-light0" />
                                    <div>
                                        <p className="text-xs font-heading font-bold text-gray-400 uppercase tracking-widest">Quantity</p>
                                        <p className="font-bold">{food.quantity}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-2xl">
                                    <Clock className="h-6 w-6 mr-4 text-primary-light0" />
                                    <div>
                                        <p className="text-xs font-heading font-bold text-gray-400 uppercase tracking-widest">Expires In</p>
                                        <p className={`font-bold ${isExpired ? 'text-red-600' : 'text-primary'}`}>
                                            {timeLeft()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start text-gray-700 bg-primary-light/50 p-5 rounded-2xl mb-10">
                                <MapPin className="h-6 w-6 mr-4 text-primary-light0 mt-1" />
                                <div>
                                    <p className="text-xs font-heading font-bold text-gray-400 uppercase tracking-widest">Pickup Location</p>
                                    <p className="font-bold">{food.pickupLocation}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-10">
                                <div className="flex items-center mb-8">
                                    <div className="bg-primary-light p-3 rounded-2xl mr-4 text-primary">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-heading font-bold text-gray-400 uppercase tracking-widest">Donor</p>
                                        <p className="font-bold text-xl text-gray-900">
                                            {food.donor.organization || `${food.donor.firstName} ${food.donor.lastName}`}
                                        </p>
                                    </div>
                                </div>

                                {user?.role === 'receiver' && food.status === 'available' && !isExpired && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-heading font-bold text-gray-500 uppercase tracking-wider ml-1">Add a message (Optional)</label>
                                            <textarea 
                                                value={requestMessage}
                                                onChange={(e) => setRequestMessage(e.target.value)}
                                                placeholder="e.g. I can pick this up in 30 minutes. Thank you!"
                                                className="input-field min-h-[100px] py-3"
                                            ></textarea>
                                        </div>
                                        <button
                                            onClick={handleRequest}
                                            disabled={claiming}
                                            className="btn-primary w-full py-5 text-xl shadow-xl shadow-primary-light"
                                        >
                                            {claiming ? 'Sending Request...' : 'Request This Food'}
                                        </button>
                                        <p className="text-center text-xs text-gray-400 italic">
                                            The donor will review your request and get back to you.
                                        </p>
                                    </div>
                                )}

                                {(!user || user.role !== 'receiver') && food.status === 'available' && !isExpired && (
                                    <div className="bg-gray-900 p-6 rounded-2xl text-white flex items-start shadow-xl">
                                        <div className="mr-4 mt-1"><Utensils size={20} className="text-primary-light" /></div>
                                        <div>
                                            <p className="font-bold font-heading">Interested in this food?</p>
                                            <p className="text-sm mt-1 text-gray-300">Please log in as a <strong>Receiver</strong> to send a request to the donor.</p>
                                            <Link href="/login" className="inline-block mt-3 font-bold text-primary-light hover:underline transition-colors">Log in now</Link>
                                        </div>
                                    </div>
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
