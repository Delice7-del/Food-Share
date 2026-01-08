'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Scale, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="flex items-center mb-8">
                        <div className="bg-orange-100 p-3 rounded-2xl text-orange-600 mr-4">
                            <Scale size={32} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Terms of Service</h1>
                    </div>

                    <div className="prose prose-orange max-w-none text-gray-600 space-y-6">
                        <p className="text-lg">
                            By using the FoodShare platform, you agree to comply with the following terms and conditions. Please read them carefully.
                        </p>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <CheckCircle className="mr-2 text-orange-500" size={20} />
                                User Responsibilities
                            </h2>
                            <p>
                                Users must provide accurate information when registering and posting food listings. Donors are responsible for ensuring that the food they share is safe, fresh, and properly stored until pickup.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <AlertTriangle className="mr-2 text-orange-500" size={20} />
                                Liability and Safety
                            </h2>
                            <p>
                                FoodShare is a platform that facilitates connections. We do not handle food directly and cannot guarantee its quality or safety. Users accept all risks associated with donating or receiving food through the platform.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <HelpCircle className="mr-2 text-orange-500" size={20} />
                                Appropriate Use
                            </h2>
                            <p>
                                Any form of harassment, fraud, or misuse of the platform is strictly prohibited and will result in immediate account termination. The platform is intended solely for charitable food sharing purposes.
                            </p>
                        </section>

                        <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-400">
                            Last updated: January 2026
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
