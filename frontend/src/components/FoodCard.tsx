'use client';

import { Calendar, MapPin, Tag, User, Utensils, Trash2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

interface FoodProps {
    food: {
        _id: string;
        name: string;
        quantity: string;
        description: string;
        pickupLocation: string;
        expiryDate: string;
        dietaryTags: string[];
        status: 'available' | 'claimed';
        contactMethod: string;
        imageUrl?: string;
        donor: {
            _id: string;
            firstName: string;
            lastName: string;
            organization?: string;
        };
    };
    onClaim?: () => void;
    onDelete?: () => void;
}

const FoodCard = ({ food, onClaim, onDelete }: FoodProps) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleClaim = async () => {
        if (!confirm('Are you sure you want to claim this food?')) return;

        setLoading(true);
        try {
            await api.post(`/food/claim/${food._id}`);
            alert('Food claimed successfully!');
            if (onClaim) onClaim();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to claim food');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this listing?')) return;

        setLoading(true);
        try {
            await api.delete(`/food/${food._id}`);
            alert('Listing deleted successfully!');
            if (onDelete) onDelete();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete food');
        } finally {
            setLoading(false);
        }
    };

    const getTimeLeft = () => {
        const diff = new Date(food.expiryDate).getTime() - new Date().getTime();
        if (diff <= 0) return 'Expired';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h left`;
    };

    const isExpired = new Date(food.expiryDate) < new Date();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
            {food.imageUrl ? (
                <div className="h-48 overflow-hidden">
                    <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="h-48 bg-orange-50 flex items-center justify-center">
                    <Utensils className="h-12 w-12 text-orange-200" />
                </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-900">{food.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${food.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {food.status === 'available' ? 'Available' : 'Claimed'}
                    </span>
                </div>

                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{food.description}</p>

                <div className="mt-4 space-y-2 flex-grow">
                    <div className="flex items-center text-sm text-gray-500">
                        <Tag className="h-4 w-4 mr-2" />
                        <span>Quantity: {food.quantity}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 font-medium">
                        <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                        <span className={isExpired ? 'text-red-600' : 'text-orange-600'}>
                            {getTimeLeft()}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{food.pickupLocation}</span>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {food.dietaryTags.map((tag) => (
                        <span key={tag} className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-6 flex gap-2">
                    <Link
                        href={`/food/${food._id}`}
                        className="flex-grow text-center text-orange-600 border border-orange-600 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                    >
                        View Details
                    </Link>
                    {user?.role === 'receiver' && food.status === 'available' && !isExpired && (
                        <button
                            onClick={handleClaim}
                            disabled={loading}
                            className="flex-grow bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? '...' : 'Claim'}
                        </button>
                    )}
                    {user?.id === food.donor._id && (
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete Listing"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodCard;
