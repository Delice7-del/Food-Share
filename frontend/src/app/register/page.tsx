'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Twitter, Github, Chrome } from 'lucide-react';

const RegisterPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'receiver',
        organization: '',
        latitude: 0,
        longitude: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const registrationData = {
                ...formData,
                location: {
                    type: 'Point',
                    coordinates: [0, 0]
                }
            };
            await api.post('/auth/register', registrationData);
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Full Screen Image Background */}
            <div className="absolute inset-0 z-0">
                <img src="/hero/plate4.png" alt="FoodShare Background" className="w-full h-full object-cover" />
                {/* Subtle dark overlay to ensure text readability on the left */}
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Left Side - Text */}
            <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
                <div className="w-full max-w-xl text-white">
                    <h1 className="text-5xl lg:text-7xl font-heading font-extrabold mb-6 leading-tight drop-shadow-lg">
                        Join FoodShare
                    </h1>
                    <p className="text-lg lg:text-xl text-white font-body max-w-md leading-relaxed drop-shadow-md">
                        Create an account to start sharing or receiving surplus food and make a positive impact in your community.
                    </p>
                </div>
            </div>

            {/* Right Side - Form with White Glassmorphism */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10 bg-white/10 backdrop-blur-xl border-l border-white/30 shadow-2xl overflow-y-auto max-h-screen">
                
                <div className="max-w-md w-full relative z-10 pr-0 sm:pr-24 my-12">
                    <div className="mb-10">
                        <h2 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight mb-2">
                            Sign up
                        </h2>
                        <p className="text-sm text-gray-700 font-medium">
                            Fill in your details to create an account.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl text-sm text-center font-bold">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div className="relative">
                                <label className="text-[10px] font-heading font-extrabold text-gray-900 mb-1 block uppercase tracking-wider">First Name</label>
                                <input
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-gray-400 focus:border-gray-900 text-gray-900 py-1 outline-none transition-colors text-sm placeholder-gray-900 font-medium"
                                    placeholder="John"
                                />
                            </div>
                            <div className="relative">
                                <label className="text-[10px] font-heading font-extrabold text-gray-900 mb-1 block uppercase tracking-wider">Last Name</label>
                                <input
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-gray-400 focus:border-gray-900 text-gray-900 py-1 outline-none transition-colors text-sm placeholder-gray-900 font-medium"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-heading font-extrabold text-gray-900 mb-1 block uppercase tracking-wider">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-400 focus:border-gray-900 text-gray-900 py-1 outline-none transition-colors text-sm placeholder-gray-600 font-medium"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-heading font-extrabold text-gray-900 mb-1 block uppercase tracking-wider">Phone Number</label>
                            <input
                                name="phone"
                                type="text"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-400 focus:border-gray-900 text-gray-900 py-1 outline-none transition-colors text-sm placeholder-gray-600 font-medium"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-heading font-extrabold text-gray-900 mb-1 block uppercase tracking-wider">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-400 focus:border-gray-900 text-gray-900 py-1 outline-none transition-colors text-sm placeholder-gray-600 font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-heading font-extrabold text-gray-900 mb-1 block uppercase tracking-wider">I want to...</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-400 focus:border-gray-900 text-gray-900 py-1 outline-none transition-colors text-sm appearance-none cursor-pointer font-medium"
                            >
                                <option value="receiver" className="text-gray-900 bg-white">Receive Food</option>
                                <option value="donor" className="text-gray-900 bg-white">Donate Food</option>
                            </select>
                        </div>

                        {formData.role === 'donor' && (
                            <div className="relative animate-fade-in">
                                <label className="text-[10px] font-heading font-extrabold text-gray-900 mb-1 block uppercase tracking-wider">Organization Name (Optional)</label>
                                <input
                                    name="organization"
                                    type="text"
                                    value={formData.organization}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-gray-400 focus:border-gray-900 text-gray-900 py-1 outline-none transition-colors text-sm placeholder-gray-600 font-medium"
                                    placeholder="Restaurant or Supermarket name"
                                />
                            </div>
                        )}

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-hover text-white font-heading font-extrabold py-4 rounded-lg transition-colors shadow-lg uppercase tracking-wider text-sm cursor-pointer disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing up...' : 'Sign up'}
                            </button>
                        </div>

                        <div className="text-center text-xs text-gray-800 font-medium mt-6 flex items-center justify-center space-x-2">
                            <span>Already a Member?</span>
                            <Link href="/login" className="text-gray-900 font-extrabold hover:text-primary-hover transition-colors">
                                Sign in here
                            </Link>
                        </div>
                    </form>

                    {/* Decorative border line for social split as seen in design */}
                    <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-[70%] bg-gray-400/50"></div>
                    
                    {/* Social Login Buttons (Absolute positioned to the far right) */}
                    <div className="mt-12 sm:mt-0 sm:absolute sm:-right-16 sm:top-1/2 sm:-translate-y-1/2 flex sm:flex-col items-center justify-center gap-6">
                        <span className="text-[10px] text-gray-800 font-extrabold uppercase hidden sm:block py-2 absolute top-1/2 -translate-y-1/2 -left-10 px-2 bg-transparent">OR</span>
                        <button className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition-transform shadow-lg border border-gray-100">
                            <Github size={18} fill="currentColor" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition-transform shadow-lg border border-gray-100">
                            <Twitter size={18} fill="currentColor" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:scale-110 transition-transform shadow-lg border border-gray-100">
                            <Chrome size={18} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

