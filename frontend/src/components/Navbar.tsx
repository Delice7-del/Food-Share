'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Utensils, User, LogOut, PlusCircle, Bell } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled 
                ? 'bg-white/80 backdrop-blur-md shadow-md py-2' 
                : 'bg-white border-b border-gray-100 py-4'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <Utensils className="h-9 w-9 text-primary" />
                            <span className="ml-2 text-2xl font-heading font-extrabold text-gray-900 tracking-tight">FoodShare</span>
                        </Link>
                        <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                            <Link
                                href="/browse"
                                className="inline-flex items-center px-1 pt-1 text-sm font-heading font-extrabold text-gray-700 hover:text-primary transition-colors"
                            >
                                Browse
                            </Link>
                            {!user ? (
                                <>
                                    <Link
                                        href="/#mission"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-heading font-extrabold text-gray-700 hover:text-primary transition-colors"
                                    >
                                        Mission
                                    </Link>
                                    <Link
                                        href="/about"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-heading font-extrabold text-gray-700 hover:text-primary transition-colors"
                                    >
                                        About
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {user.role === 'donor' ? (
                                        <Link
                                            href="/donor/dashboard"
                                            className="inline-flex items-center px-1 pt-1 text-sm font-heading font-extrabold text-gray-700 hover:text-primary transition-colors"
                                        >
                                            Donor Portal
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/receiver/dashboard"
                                            className="inline-flex items-center px-1 pt-1 text-sm font-heading font-extrabold text-gray-700 hover:text-primary transition-colors"
                                        >
                                            My Requests
                                        </Link>
                                    )}
                                </>
                            )}
                            <Link
                                href="/contact"
                                className="inline-flex items-center px-1 pt-1 text-sm font-heading font-extrabold text-gray-700 hover:text-primary transition-colors"
                            >
                                Contact
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-6">
                                {user.role === 'donor' && (
                                    <Link
                                        href="/donor/posts/new"
                                        className="hidden md:inline-flex items-center px-5 py-2.5 text-sm font-heading font-extrabold rounded-xl text-white bg-primary hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Donate Food
                                    </Link>
                                )}
                                <Link
                                    href="/notifications"
                                    className="p-2 rounded-full text-gray-400 hover:text-primary transition-colors relative"
                                    title="Notifications"
                                >
                                    <Bell className="h-6 w-6" />
                                </Link>
                                <Link
                                    href="/profile"
                                    className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors font-heading font-bold text-sm"
                                >
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <span className="hidden lg:inline">{user.firstName}</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-6 w-6" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex space-x-4">
                                <Link
                                    href="/login"
                                    className="text-gray-700 hover:text-primary px-3 py-2 rounded-xl text-sm font-heading font-extrabold transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-primary text-white hover:bg-primary-hover px-6 py-2.5 rounded-xl text-sm font-heading font-extrabold transition-all shadow-lg shadow-primary/20"
                                >
                                    Join Now
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
