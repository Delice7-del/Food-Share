'use client';

import { Calendar, MapPin, Tag, User, Utensils, Trash2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FoodProps {
    food: {
        _id: string;
        title?: string;
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
    const router = useRouter();
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

    // Helper to safely get quantity string
    const getQuantityStr = () => {
        if (typeof food.quantity === 'object' && food.quantity !== null) {
            return `${(food.quantity as any).amount} ${(food.quantity as any).unit}`;
        }
        return food.quantity || 'Not specified';
    };

    // Helper to safely get location string
    const getLocationStr = () => {
        if (typeof (food as any).location === 'object' && (food as any).location !== null) {
            const loc = (food as any).location;
            return loc.address?.street || loc.address?.city || 'Local Area';
        }
        return (food as any).pickupLocation || 'Local Area';
    };

    // Helper to safely get dietary tags
    const getDietaryTags = () => {
        if (Array.isArray(food.dietaryTags) && food.dietaryTags.length > 0) return food.dietaryTags;
        if ((food as any).category) return [(food as any).category];
        return [];
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
            {food.imageUrl ? (
                <div className="h-48 overflow-hidden">
                    <img src={food.imageUrl} alt={food.title || food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
            ) : (
                <div className="h-48 bg-primary/5 flex items-center justify-center">
                    <Utensils className="h-12 w-12 text-primary/20" />
                </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-heading font-bold text-gray-900 truncate pr-2">
                        {food.title || food.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-heading font-extrabold uppercase tracking-wider ${food.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {food.status}
                    </span>
                </div>

                <p className="mt-2 text-sm text-gray-800 font-medium line-clamp-2 leading-relaxed">{food.description}</p>

                <div className="mt-4 space-y-2 flex-grow">
                    <div className="flex items-center text-sm text-gray-700 font-bold">
                        <Tag className="h-4 w-4 mr-2 text-primary" />
                        <span>Quantity: {getQuantityStr()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 font-bold">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span className={isExpired ? 'text-red-600 font-bold' : 'text-gray-900 font-bold'}>
                            {getTimeLeft()}
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700 font-bold">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        <span className="truncate">{getLocationStr()}</span>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {getDietaryTags().map((tag) => (
                        <span key={tag} className="bg-primary/5 text-primary-hover px-2 py-1 rounded text-[10px] font-heading font-extrabold uppercase tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-6 flex gap-2">
                    <Link
                        href={`/food/${food._id}`}
                        className="flex-grow text-center text-primary border border-primary py-2 rounded-lg font-heading font-extrabold hover:bg-primary/5 transition-colors"
                    >
                        View Details
                    </Link>
                    {user?.role === 'receiver' && food.status === 'available' && !isExpired && (
                        <button
                            onClick={() => router.push(`/food/${food._id}`)}
                            className="flex-grow bg-primary text-white py-2 rounded-lg font-heading font-extrabold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                        >
                            Request
                        </button>
                    )}
                    {user?.id === (typeof food.donor === 'object' ? food.donor._id : food.donor) && (
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
