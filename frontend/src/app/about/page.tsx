'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart, Globe, Shield, Users } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-orange-600 py-20 text-white text-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Our Mission</h1>
                        <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
                            Connecting communities to reduce food waste and ensure no one goes hungry.
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why FoodShare exists</h2>
                            <p className="text-lg text-gray-600 mb-4">
                                Every year, billions of tons of perfectly good food go to waste, while millions of people suffer from food insecurity. We believe there is a better way.
                            </p>
                            <p className="text-lg text-gray-600">
                                FoodShare was born out of a simple idea: that excess food should be shared, not thrown away. By creating a bridge between those who have surplus and those who have a need, we can build a more sustainable and compassionate world.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                <Globe className="h-10 w-10 text-orange-500 mb-4" />
                                <h3 className="font-bold text-gray-900">Global Problem</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                <Heart className="h-10 w-10 text-orange-500 mb-4" />
                                <h3 className="font-bold text-gray-900">Local Solution</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                <Shield className="h-10 w-10 text-orange-500 mb-4" />
                                <h3 className="font-bold text-gray-900">Safe Platform</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                <Users className="h-10 w-10 text-orange-500 mb-4" />
                                <h3 className="font-bold text-gray-900">Community Driven</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Who it helps</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <div className="text-4xl font-bold text-orange-600 mb-2">Donors</div>
                                    <p className="text-gray-600">Businesses and individuals who want to reduce their environmental footprint and help their neighbors.</p>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-orange-600 mb-2">Receivers</div>
                                    <p className="text-gray-600">Individuals, families, and organizations who can make use of fresh, surplus food.</p>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-orange-600 mb-2">Environment</div>
                                    <p className="text-gray-600">Less food in landfills means fewer greenhouse gas emissions and a healthier planet.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
