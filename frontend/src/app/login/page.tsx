'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Twitter, Github, Chrome } from 'lucide-react';

const LoginPage = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', formData);
            login(res.data.token, res.data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid email or password');
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
                        Let's Get Started
                    </h1>
                    <p className="text-lg lg:text-xl text-white font-body max-w-md leading-relaxed drop-shadow-md">
                        Join our sustainable community and start sharing surplus fresh meals with neighbors in need today.
                    </p>
                </div>
            </div>

            {/* Right Side - Form with White Glassmorphism */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10 bg-white/10 backdrop-blur-xl border-l border-white/30 shadow-2xl">
                
                <div className="max-w-md w-full relative z-10 pr-0 sm:pr-24">
                    <div className="mb-12">
                        <h2 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight mb-2">
                            Welcome back
                        </h2>
                        <p className="text-sm text-gray-700 font-medium">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl text-sm text-center font-bold">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-6">
                            <div className="relative">
                                <label className="text-xs font-heading font-extrabold text-gray-900 mb-2 block uppercase tracking-wider">E-mail</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-gray-400 focus:border-gray-900 text-gray-900 py-2 outline-none transition-colors text-sm placeholder-gray-900 font-medium"
                                    placeholder="Enter your e-mail"
                                />
                            </div>
                            <div className="relative">
                                <label className="text-xs font-heading font-extrabold text-gray-900 mb-2 block uppercase tracking-wider">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-gray-400 focus:border-gray-900 text-gray-900 py-2 outline-none transition-colors text-sm placeholder-gray-900 font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-400 bg-transparent text-[#F5CBB2] focus:ring-[#F5CBB2]" />
                                <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-800 font-bold">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-xs">
                                <Link href="#" className="text-gray-800 font-bold hover:text-gray-900 transition-colors">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#F5CBB2] hover:bg-[#e4b89d] text-gray-900 font-heading font-extrabold py-4 rounded-lg transition-colors shadow-lg uppercase tracking-wider text-sm cursor-pointer disabled:cursor-not-allowed"
                            >
                                {loading ? 'Logging in...' : 'Log in'}
                            </button>
                        </div>

                        <p className="text-center text-xs text-gray-800 font-medium mt-8">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-gray-900 font-extrabold hover:text-[#F5CBB2] transition-colors">
                                Register here
                            </Link>
                        </p>
                    </form>

                    {/* Decorative border line for social split as seen in design */}
                    <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-[60%] bg-gray-400/50"></div>
                    
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

export default LoginPage;

