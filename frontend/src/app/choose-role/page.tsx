'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { HandHeart, ShoppingBag, ArrowRight, Utensils } from 'lucide-react';

export default function ChooseRole() {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleSelection = async (role: 'donor' | 'receiver') => {
    setLoading(true);
    try {
      await api.put('/users/profile', { role });
      await checkAuth();
      router.push(role === 'donor' ? '/donor/dashboard' : '/');
    } catch (err) {
      alert('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-primary-light rounded-3xl mb-6 text-primary">
            <Utensils size={48} />
          </div>
          <h1 className="text-5xl font-heading font-extrabold text-gray-900 tracking-tight mb-4">
            Welcome to FoodShare
          </h1>
          <p className="text-xl text-gray-500 font-heading font-medium">
            How would you like to participate in our community?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Donor Option */}
          <button
            onClick={() => handleRoleSelection('donor')}
            disabled={loading}
            className="group relative bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 hover:border-primary-light0 hover:shadow-xl hover:shadow-primary-light transition-all text-left flex flex-col h-full"
          >
            <div className="bg-primary-light p-5 rounded-3xl text-primary w-fit mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
              <HandHeart size={40} />
            </div>
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">I want to Donate</h2>
            <p className="text-gray-500 font-body mb-10 flex-grow leading-relaxed">
              Share surplus food from your restaurant, grocery store, or household with those in need in your local community.
            </p>
            <div className="flex items-center text-primary font-heading font-bold text-lg">
              <span>Continue as Donor</span>
              <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>

          {/* Receiver Option */}
          <button
            onClick={() => handleRoleSelection('receiver')}
            disabled={loading}
            className="group relative bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-100 transition-all text-left flex flex-col h-full"
          >
            <div className="bg-blue-50 p-5 rounded-3xl text-blue-600 w-fit mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">I'm looking for Food</h2>
            <p className="text-gray-500 font-body mb-10 flex-grow leading-relaxed">
              Find and request surplus food listings nearby. Direct connection with donors to help reduce food waste.
            </p>
            <div className="flex items-center text-blue-600 font-heading font-bold text-lg">
              <span>Continue as Receiver</span>
              <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </div>
        
        <p className="text-center text-gray-400 mt-12 text-sm">
          You can always update your role later in your profile settings.
        </p>
      </div>
    </div>
  );
}
