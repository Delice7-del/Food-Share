'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

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
            // Mock coordinates for now
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-heading font-extrabold text-gray-900 tracking-tight">
                        Join FoodShare
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Create an account to start sharing or receiving surplus food.
                    </p>
                </div>
                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-wider ml-1">First Name</label>
                            <input
                                name="firstName"
                                type="text"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="John"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-wider ml-1">Last Name</label>
                            <input
                                name="lastName"
                                type="text"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

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

                    <div className="space-y-1">
                        <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                        <input
                            name="phone"
                            type="text"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-wider ml-1">I want to...</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="input-field appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E')]"
                        >
                            <option value="receiver">Receive Food</option>
                            <option value="donor">Donate Food</option>
                        </select>
                    </div>

                    {formData.role === 'donor' && (
                        <div className="space-y-1">
                            <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-wider ml-1">Organization Name (Optional)</label>
                            <input
                                name="organization"
                                type="text"
                                value={formData.organization}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Restaurant or Supermarket name"
                            />
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-base shadow-lg shadow-primary-light"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="font-heading font-bold text-primary hover:text-primary-hover">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
