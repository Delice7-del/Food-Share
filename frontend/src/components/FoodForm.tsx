'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

const FoodForm = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        description: '',
        pickupLocation: '',
        expiryDate: '',
        dietaryTags: '',
        contactMethod: '',
        imageUrl: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const tags = formData.dietaryTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            await api.post('/food', {
                ...formData,
                dietaryTags: tags
            });
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to post food listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Post New Food Listing</h2>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Food Name</label>
                <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="e.g., Fresh Apples"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                    type="text"
                    name="quantity"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="e.g., 5kg, 3 boxes"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    name="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="What kind of food is it? Any special notes?"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                <input
                    type="text"
                    name="pickupLocation"
                    required
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Full address or landmark"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input
                    type="date"
                    name="expiryDate"
                    required
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Dietary Tags (comma separated)</label>
                <input
                    type="text"
                    name="dietaryTags"
                    value={formData.dietaryTags}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="e.g., Vegan, Gluten-free, Nut-free"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Contact Method (e.g. Phone, Email, WhatsApp)</label>
                <input
                    type="text"
                    name="contactMethod"
                    required
                    value={formData.contactMethod}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="How should people reach you?"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Photo URL (Optional)</label>
                <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="https://example.com/photo.jpg"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
                {loading ? 'Posting...' : 'Post Listing'}
            </button>
        </form>
    );
};

export default FoodForm;
