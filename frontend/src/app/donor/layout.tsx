'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  PlusCircle, 
  List, 
  User, 
  LogOut, 
  Bell, 
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Package
} from 'lucide-react';

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'donor')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-500 font-heading animate-pulse">Loading Donor Portal...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/donor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/donor/post-donation', label: 'Post Donation', icon: PlusCircle },
    { href: '/donor/my-donations', label: 'My Donations', icon: List },
    { href: '/donor/requests', label: 'Requests', icon: MessageSquare },
    { href: '/donor/notifications', label: 'Notifications', icon: Bell },
    { href: '/donor/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-100 z-50 
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8">
            <Link href="/donor/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <span className="text-xl font-heading font-extrabold text-gray-900 tracking-tight">Food<span className="text-primary">Share</span></span>
                <div className="text-[10px] font-heading font-extrabold uppercase tracking-[0.2em] text-gray-400 leading-none mt-1">Donor Portal</div>
              </div>
            </Link>
          </div>

          {/* User Profile Summary */}
          <div className="mx-6 mb-8 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-lg">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-heading font-bold text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-[10px] text-gray-400 truncate">{user.email}</div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-grow px-4 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-heading text-sm font-medium ${
                    active 
                      ? 'bg-primary-light text-primary font-bold shadow-sm' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon size={20} className={active ? 'text-primary' : 'text-gray-400'} />
                  <span>{item.label}</span>
                  {active && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 mt-auto">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-heading text-sm font-medium"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
          <Link href="/donor/dashboard" className="font-heading font-extrabold text-xl">
            Food<span className="text-primary">Share</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content Wrapper */}
        <main className="flex-grow overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
