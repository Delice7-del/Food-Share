'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldAlert, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="flex items-center mb-8">
                        <div className="bg-orange-100 p-3 rounded-2xl text-orange-600 mr-4">
                            <ShieldAlert size={32} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
                    </div>

                    <div className="prose prose-orange max-w-none text-gray-600 space-y-6">
                        <p className="text-lg">
                            At FoodShare, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use our platform.
                        </p>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Eye className="mr-2 text-orange-500" size={20} />
                                Information We Collect
                            </h2>
                            <p>
                                We collect information that you provide directly to us, such as when you create an account, post a food listing, or communicate with other users. This may include your name, email address, phone number, and organization details.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Lock className="mr-2 text-orange-500" size={20} />
                                How We Use Your Information
                            </h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>To facilitate food sharing between donors and receivers.</li>
                                <li>To maintain and improve our platform's functionality.</li>
                                <li>To communicate with you regarding your listings or account.</li>
                                <li>To ensure the safety and security of our community.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <FileText className="mr-2 text-orange-500" size={20} />
                                Sharing Information
                            </h2>
                            <p>
                                Your contact information (like phone or email) is only shared with another user when you post or claim a food listing, specifically to facilitate the pickup process. We do not sell your personal data to third parties.
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
