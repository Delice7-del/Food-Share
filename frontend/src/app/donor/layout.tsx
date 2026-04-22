'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, List, User, LogOut } from 'lucide-react';

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'donor')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-50">
          <Link href="/donor/dashboard" className="text-2xl font-heading font-extrabold text-primary">
            FoodShare
          </Link>
          <p className="text-xs text-gray-400 font-heading uppercase tracking-wider mt-1">Donor Portal</p>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <Link href="/donor/dashboard" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-primary-light hover:text-primary rounded-xl transition-all font-heading">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/donor/posts/new" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-primary-light hover:text-primary rounded-xl transition-all font-heading">
            <PlusCircle size={20} />
            <span>Post Donation</span>
          </Link>
          <Link href="/donor/posts" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-primary-light hover:text-primary rounded-xl transition-all font-heading">
            <List size={20} />
            <span>My Donations</span>
          </Link>
          <Link href="/donor/profile" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-primary-light hover:text-primary rounded-xl transition-all font-heading">
            <User size={20} />
            <span>Profile</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-heading"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 md:hidden">
          <Link href="/donor/dashboard" className="text-xl font-heading font-extrabold text-primary">
            FoodShare
          </Link>
          <button className="text-gray-500">
             {/* Mobile menu icon could go here */}
             <List size={24} />
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
