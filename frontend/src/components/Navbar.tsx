'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Utensils, User, LogOut, PlusCircle } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <Utensils className="h-8 w-8 text-orange-500" />
                            <span className="ml-2 text-xl font-bold text-gray-900">FoodShare</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-900"
                            >
                                Home
                            </Link>
                            <Link
                                href="/about"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-900"
                            >
                                About
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-900"
                            >
                                Contact
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                {user.role === 'donor' && (
                                    <Link
                                        href="/add-food"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Post Food
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    <User className="h-6 w-6" />
                                </Link>
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    <LogOut className="h-6 w-6" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex space-x-4">
                                <Link
                                    href="/login"
                                    className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-orange-600 text-white hover:bg-orange-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
