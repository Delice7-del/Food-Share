'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

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
        console.log("Login form data:", formData);


        try {
            const res = await api.post('/auth/login', formData);
            login(res.data.token, res.data.user);
        } catch (err: any) {
            console.error('Login Failed:', err);
            if (err.response) {
                console.error('Server Data:', err.response.data);
                console.error('Server Status:', err.response.status);
                setError(err.response.data.error || 'Invalid email or password');
            } else if (err.request) {
                console.error('No response received:', err.request);
                setError('No response from server. Is the backend running?');
            } else {
                console.error('Error setting up request:', err.message);
                setError('Request failed. Check console for details.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-heading font-extrabold text-gray-900 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Sign in to manage your donations or requests.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm text-center font-medium">
                            {error}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-base shadow-lg shadow-primary-light"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-heading font-bold text-primary hover:text-primary-hover">
                            Create one now
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
