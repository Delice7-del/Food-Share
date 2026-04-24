'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { 
  PlusCircle, 
  Package, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Image as ImageIcon,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function PostDonationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'vegetables',
    quantityAmount: '',
    quantityUnit: 'kg',
    expiryDate: '',
    pickupDate: '',
    pickupTimeStart: '09:00',
    pickupTimeEnd: '17:00',
    location: '',
    imageUrl: ''
  });

  const categories = [
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'grains', label: 'Grains' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'meat', label: 'Meat' },
    { value: 'canned', label: 'Canned Food' },
    { value: 'baked', label: 'Baked Goods' },
    { value: 'other', label: 'Other' },
  ];

  const units = ['kg', 'lbs', 'pieces', 'cans', 'boxes', 'bottles', 'bags'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Build the data structure expected by the backend
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        quantity: {
          amount: parseFloat(formData.quantityAmount),
          unit: formData.quantityUnit
        },
        expiryDate: new Date(formData.expiryDate).toISOString(),
        pickupDate: new Date(formData.pickupDate).toISOString(),
        pickupTime: {
          start: formData.pickupTimeStart,
          end: formData.pickupTimeEnd
        },
        location: {
          type: 'Point',
          coordinates: [0, 0], // In a real app, we would geocode the address string
          address: {
            street: formData.location,
            city: 'Local City',
            state: 'Local State',
            zipCode: '12345'
          }
        },
        imageUrl: formData.imageUrl
      };

      const res = await api.post('/donations', payload);
      
      if (res.data.success) {
        setSuccess(true);
        // Important: Redirect after a brief delay to show success state
        setTimeout(() => {
          router.push('/donor/my-donations');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Failed to post donation', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create donation. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/10">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-heading font-extrabold text-gray-900 mb-2">Donation Posted!</h2>
        <p className="text-gray-500 text-center max-w-sm">
          Your donation is now live and visible to those who need it. Redirecting you to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
          Post a <span className="text-primary">New Donation</span>
        </h1>
        <p className="text-gray-500 mt-1">Provide details about the food you want to share.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600 text-sm animate-shake">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <section className="card p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Package className="text-primary" size={20} />
            <h2 className="text-xl font-heading font-bold text-gray-900">Food Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Food Title</label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Fresh Garden Vegetables"
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Description</label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us more about the items, condition, etc."
                rows={3}
                className="input-field resize-none py-4"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field appearance-none bg-white"
              >
                {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <div className="flex-[2]">
                <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Amount</label>
                <input
                  required
                  type="number"
                  step="0.1"
                  name="quantityAmount"
                  value={formData.quantityAmount}
                  onChange={handleChange}
                  placeholder="2.5"
                  className="input-field"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Unit</label>
                <select
                  name="quantityUnit"
                  value={formData.quantityUnit}
                  onChange={handleChange}
                  className="input-field appearance-none bg-white"
                >
                  {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Logistics Section */}
        <section className="card p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-primary" size={20} />
            <h2 className="text-xl font-heading font-bold text-gray-900">Logistics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Expiry Date</label>
              <input
                required
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Pickup Date</label>
              <input
                required
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Pickup Start Time</label>
              <input
                required
                type="time"
                name="pickupTimeStart"
                value={formData.pickupTimeStart}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Pickup End Time</label>
              <input
                required
                type="time"
                name="pickupTimeEnd"
                value={formData.pickupTimeEnd}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Pickup Location (Address)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter full pickup address..."
                  className="input-field pl-12"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">Image URL (Optional)</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="input-field pl-12"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-4 px-6 rounded-2xl font-heading font-bold text-gray-500 hover:bg-white hover:shadow-sm transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] btn-primary py-4 text-base flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                <span>Publish Donation</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
