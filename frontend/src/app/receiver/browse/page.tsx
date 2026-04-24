'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import api from '@/services/api';
import { 
  Search, 
  Filter, 
  MapPin, 
  Tag, 
  Clock, 
  Utensils,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function BrowseFoodPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      // Fetch from the unified donations endpoint
      const res = await api.get('/donations', {
        params: {
          status: 'available',
          category: categoryFilter === 'all' ? undefined : categoryFilter
        }
      });
      // The new endpoint returns { success: true, data: { donations, pagination } }
      setFoods(res.data.data?.donations || []);
    } catch (err) {
      console.error('Failed to fetch foods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();

    if (socket) {
      socket.on('donation_created', () => {
        fetchFoods();
      });
      socket.on('donation_updated', (data: any) => {
        // Optimistically update the list if a donation status changes
        if (data.status !== 'available') {
          setFoods((prevFoods: any) => prevFoods.filter((f: any) => f._id !== data.id));
        } else {
          fetchFoods();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('donation_created');
        socket.off('donation_updated');
      }
    };
  }, [socket, categoryFilter]);

  const filteredFoods = foods.filter((food: any) => {
    const title = food.title || food.name || '';
    const desc = food.description || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const openRequestModal = (food: any) => {
    setSelectedFood(food);
    setIsModalOpen(true);
    setRequestStatus('idle');
    setRequestMessage('');
  };

  const handleRequest = async () => {
    if (!selectedFood) return;
    
    setRequestLoading(true);
    setRequestStatus('idle');
    
    try {
      // Note: This endpoint still expects donationId which we successfully migrated to use Donation model in backend
      await api.post('/receiver/requests', {
        donationId: selectedFood._id,
        message: requestMessage || `Hi, I would like to request this food for our organization.`
      });
      setRequestStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
      }, 2000);
    } catch (err: any) {
      console.error('Request failed', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Request failed. Please try again.';
      setError(errorMsg);
      setRequestStatus('error');
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
            Browse <span className="text-primary">Available Food</span>
          </h1>
          <p className="text-gray-500 mt-1">Discover and request surplus food near you.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field pl-12 appearance-none bg-white/50"
          >
            <option value="all">All Categories</option>
            <option value="fruits">Fruits</option>
            <option value="vegetables">Vegetables</option>
            <option value="grains">Grains</option>
            <option value="dairy">Dairy</option>
            <option value="meat">Meat</option>
            <option value="canned">Canned</option>
            <option value="baked">Baked Goods</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex items-center justify-center bg-white rounded-2xl border border-gray-100 px-4 text-sm font-heading font-bold text-gray-500">
            {filteredFoods.length} Items Found
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : filteredFoods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.map((food: any) => (
            <div key={food._id} className="card group flex flex-col h-full overflow-hidden hover:border-primary/20 transition-all">
              <div className="h-40 -mx-6 -mt-6 mb-6 bg-primary-light flex items-center justify-center relative overflow-hidden">
                {food.imageUrl || (food.images && food.images[0]?.url) ? (
                  <img src={food.imageUrl || food.images[0]?.url} alt={food.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <Utensils className="h-12 w-12 text-primary/30" />
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-heading font-extrabold uppercase tracking-wider text-primary shadow-sm">
                  {food.category || 'Food'}
                </div>
              </div>

              <div className="flex-grow">
                <h3 className="text-lg font-heading font-bold text-gray-900 truncate mb-2">
                  {food.title || food.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                  {food.description}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-xs text-gray-500">
                    <Tag size={14} className="mr-2 text-primary" />
                    <span>Quantity: {typeof food.quantity === 'object' ? `${food.quantity.amount} ${food.quantity.unit}` : food.quantity}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin size={14} className="mr-2 text-primary" />
                    <span className="truncate">
                      {food.location?.address?.city 
                        ? `${food.location.address.city}, ${food.location.address.state || ''}` 
                        : (typeof food.location?.address === 'string' ? food.location.address : 'Available')}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={14} className="mr-2 text-primary" />
                    <span>Expires: {new Date(food.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-auto pt-4 border-t border-gray-50">
                <button
                  onClick={() => openRequestModal(food)}
                  className="btn-primary py-2.5 w-full text-xs flex items-center justify-center gap-2"
                >
                  Request Food
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Utensils className="h-10 w-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No food items found</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Try adjusting your search terms or filters to see more available donations.
          </p>
          <button onClick={() => {setSearchTerm(''); setCategoryFilter('all');}} className="btn-primary">
            Clear All Filters
          </button>
        </div>
      )}

      {/* Request Modal */}
      {isModalOpen && selectedFood && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-extrabold text-gray-900">Request Confirmation</h2>
                <p className="text-gray-500 text-sm mt-1">Send a message to the donor to express your interest.</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  {selectedFood.imageUrl || (selectedFood.images && selectedFood.images[0]?.url) ? (
                    <img src={selectedFood.imageUrl || selectedFood.images[0]?.url} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Utensils className="text-primary" size={24} />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-heading font-bold text-gray-900 truncate">{selectedFood.title || selectedFood.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">Quantity: {typeof selectedFood.quantity === 'object' ? `${selectedFood.quantity.amount} ${selectedFood.quantity.unit}` : selectedFood.quantity}</p>
                </div>
              </div>

              {requestStatus === 'success' ? (
                <div className="py-8 flex flex-col items-center text-center animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-gray-900">Request Sent!</h3>
                  <p className="text-gray-500 mt-2">The donor has been notified. You can track the status in "My Requests".</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-heading font-extrabold text-gray-400 uppercase tracking-widest mb-2">
                      Message to Donor (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="e.g. We are an NGO helping local families and would love to pick this up..."
                      className="input-field resize-none py-4"
                    />
                  </div>

                  {requestStatus === 'error' && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                      <AlertCircle size={16} />
                      <span>{error || 'Failed to send request. Please ensure you are logged in as a Receiver.'}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 px-6 rounded-2xl font-heading font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequest}
                      disabled={requestLoading}
                      className="flex-[2] btn-primary flex items-center justify-center gap-2"
                    >
                      {requestLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Confirm Request'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
