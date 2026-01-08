'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import api from '@/services/api';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            // Check if contact endpoint exists or just mock for now as it's a frontend task
            await api.post('/contact', formData);
            setSuccess(true);
            setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' });
        } catch (err: any) {
            console.error('Failed to send message:', err);
            if (err.response) {
                console.error('Server Error Data:', err.response.data);
                console.error('Server Status:', err.response.status);
                // Optionally set an error state to show to the user
                alert(`Error: ${JSON.stringify(err.response.data.error || err.response.data)}`);
            } else {
                alert('Network error or server not reachable');
            }
            // Check if it's a validation error and show alert or just log
            // For now, we keep the user happy if it's a mock
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900">Get in Touch</h1>
                    <p className="mt-4 text-xl text-gray-500">We're here to help you share more and waste less.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        {success ? (
                            <div className="text-center py-12">
                                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Send size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                                <p className="text-gray-600">We'll get back to you as soon as possible.</p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="mt-8 text-orange-600 font-semibold hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1234567890"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Message</label>
                                    <textarea
                                        rows={4}
                                        required
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-3 border"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50"
                                >
                                    {sending ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 font-primary">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600 mr-4">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">Email</div>
                                        <div className="text-gray-600">support@foodshare.com</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600 mr-4">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">Phone</div>
                                        <div className="text-gray-600">+1 (555) 000-0000</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600 mr-4">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">Location</div>
                                        <div className="text-gray-600">123 Charity Lane, Hope City, HC 12345</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100">
                            <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
                                <MessageCircle className="mr-2" size={20} />
                                Need Immediate Help?
                            </h3>
                            <p className="text-orange-800 opacity-80">
                                Check our FAQ page for quick answers to common questions about donating and receiving food.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
