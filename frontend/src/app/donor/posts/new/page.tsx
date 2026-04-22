'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { ArrowLeft, Upload, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function NewDonation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    expiryTime: '',
    location: '',
    dietaryTags: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Map frontend fields to backend schema
      const payload = {
        name: formData.title,
        description: formData.description,
        quantity: formData.quantity,
        expiryDate: formData.expiryTime,
        pickupLocation: formData.location,
        dietaryTags: formData.dietaryTags,
        contactMethod: 'In-app' // Default
      };

      await api.post('/food', payload);
      alert('Donation posted successfully!');
      router.push('/donor/dashboard');
    } catch (err: any) {
      console.error('Failed to create donation:', err);
      alert(err.response?.data?.error || 'Failed to create donation. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const tags = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Contains Nuts'];

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/donor/dashboard" className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors font-heading text-sm font-medium">
        <ArrowLeft size={16} className="mr-2" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-primary-light/30">
          <h1 className="text-2xl font-heading font-extrabold text-gray-900">Post New Donation</h1>
          <p className="text-gray-500 mt-1">Provide details about the surplus food you'd like to share.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-heading font-bold text-gray-700 uppercase tracking-wider">Food Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 20 Freshly Baked Croissants"
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-heading font-bold text-gray-700 uppercase tracking-wider">Description</label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell receivers more about the food, condition, and packaging..."
              className="input-field"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-heading font-bold text-gray-700 uppercase tracking-wider">Quantity</label>
              <input
                type="text"
                name="quantity"
                required
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g. 5kg, 10 portions"
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-heading font-bold text-gray-700 uppercase tracking-wider">Expiry Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="datetime-local"
                  name="expiryTime"
                  required
                  value={formData.expiryTime}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-heading font-bold text-gray-700 uppercase tracking-wider">Pickup Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter address or organization name"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-heading font-bold text-gray-700 uppercase tracking-wider">Dietary Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-4 py-2 rounded-full text-xs font-heading font-medium transition-all ${
                    formData.dietaryTags.includes(tag)
                      ? 'bg-primary text-white shadow-md shadow-primary-light'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700 font-heading text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary min-w-[150px]"
            >
              {loading ? 'Posting...' : 'Post Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
