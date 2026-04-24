'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Filter,
  X,
  Info,
  Utensils,
  ChevronRight
} from 'lucide-react';
import Script from 'next/script';

export default function MapViewPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const mapRef = useRef<any>(null);
  const leafletLoaded = useRef(false);

  const fetchMapData = async (lat = 51.505, lng = -0.09) => {
    try {
      const res = await api.get(`/map/donations?lat=${lat}&lng=${lng}&radius=50`);
      setDonations(res.data.data?.donations || []);
      return res.data.data?.donations || [];
    } catch (err) {
      console.error('Failed to fetch map data:', err);
      return [];
    }
  };

  const initMap = () => {
    if (typeof window === 'undefined' || !window.L || mapRef.current) return;

    const L = window.L;
    const defaultLat = 51.505;
    const defaultLng = -0.09;

    mapRef.current = L.map('map-container', {
      zoomControl: false,
      attributionControl: false
    }).setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(mapRef.current);

    // Add markers
    fetchMapData(defaultLat, defaultLng).then(data => {
      data.forEach((donation: any) => {
        if (donation.coordinates && donation.coordinates.length === 2) {
          const marker = L.marker([donation.coordinates[1], donation.coordinates[0]], {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `<div class="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22V10a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v12"/><path d="M6 14h2"/><path d="M6 10h2"/><path d="M10 14h2"/><path d="M10 10h2"/></svg></div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 32]
            })
          }).addTo(mapRef.current);

          marker.on('click', () => {
            setSelectedDonation(donation);
          });
        }
      });
    });

    setLoading(false);
  };

  useEffect(() => {
    if (leafletLoaded.current) {
        initMap();
    }
    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, []);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6 animate-fade-in">
      <Script 
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
        onLoad={() => {
            leafletLoaded.current = true;
            initMap();
        }}
      />
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
            Map View
          </h1>
          <p className="text-gray-500 mt-1">Locate available food donations in your neighborhood.</p>
        </div>
      </div>

      <div className="flex-grow relative rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl bg-gray-50">
        {/* Map Container */}
        <div id="map-container" className="absolute inset-0 z-0" />

        {/* Overlay Search */}
        <div className="absolute top-6 left-6 z-10 w-full max-w-sm hidden md:block">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search location..."
                    className="w-full bg-white/90 backdrop-blur-md border border-white shadow-xl px-12 py-4 rounded-3xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-heading font-medium"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
                    <Navigation size={18} />
                </button>
            </div>
        </div>

        {/* Sidebar Info (when marker selected) */}
        {selectedDonation && (
            <div className="absolute right-6 top-6 bottom-6 z-10 w-full max-w-xs animate-slide-up">
                <div className="bg-white/95 backdrop-blur-md h-full rounded-[2.5rem] shadow-2xl border border-white flex flex-col p-6 overflow-hidden">
                    <button 
                        onClick={() => setSelectedDonation(null)}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="mt-4 mb-6">
                        <span className="px-2 py-1 rounded-lg bg-primary-light text-primary text-[10px] font-heading font-extrabold uppercase tracking-wider">
                            {selectedDonation.category}
                        </span>
                        <h3 className="text-xl font-heading font-extrabold text-gray-900 mt-2">
                            {selectedDonation.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin size={14} className="text-primary" />
                            {selectedDonation.address?.city || 'Nearby'}
                        </p>
                    </div>

                    <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-heading uppercase tracking-widest mb-1">Donor</p>
                            <p className="text-sm font-bold text-gray-800">
                                {selectedDonation.donor?.organization || `${selectedDonation.donor?.firstName} ${selectedDonation.donor?.lastName}`}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-heading uppercase tracking-widest mb-1">Quantity</p>
                            <p className="text-sm font-bold text-gray-800">
                                {selectedDonation.quantity?.amount} {selectedDonation.quantity?.unit}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-heading uppercase tracking-widest mb-1">Status</p>
                            <span className="px-2 py-0.5 rounded-lg bg-green-100 text-green-700 text-[10px] font-heading font-extrabold uppercase tracking-wider">
                                {selectedDonation.status}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <button 
                            onClick={() => window.location.href = `/receiver/browse?id=${selectedDonation.id}`}
                            className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2"
                        >
                            Request This Food
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Loading Overlay */}
        {loading && (
            <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-gray-500 font-heading font-medium">Initializing Map...</p>
                </div>
            </div>
        )}
      </div>

      <style jsx global>{`
        .custom-marker {
            background: none !important;
            border: none !important;
        }
        .leaflet-container {
            font-family: var(--font-antic), sans-serif;
        }
      `}</style>
    </div>
  );
}

declare global {
  interface Window {
    L: any;
  }
}
