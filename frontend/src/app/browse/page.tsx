'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FoodCard from '@/components/FoodCard';
import api from '@/services/api';
import { Search, Filter, Utensils } from 'lucide-react';

export default function BrowseFood() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await api.get('/food');
      setFoods(res.data);
    } catch (err) {
      console.error('Failed to fetch foods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const filteredFoods = foods.filter((food: any) => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || food.dietaryTags.includes(filter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-extrabold text-gray-900 tracking-tight">
            Browse Available <span className="text-primary">Food</span>
          </h1>
          <p className="mt-2 text-gray-500 font-heading font-medium">
            Find and request surplus food from donors in your area.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for food..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field pl-12 pr-10 appearance-none"
            >
              <option value="all">All Dietary Tags</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Gluten-free">Gluten-free</option>
              <option value="Halal">Halal</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredFoods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFoods.map((food: any) => (
              <FoodCard key={food._id} food={food} onClaim={fetchFoods} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <Utensils className="mx-auto h-16 w-16 text-gray-200 mb-4" />
            <p className="text-gray-500 text-xl font-heading font-bold">No food listings found.</p>
            <p className="text-gray-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
