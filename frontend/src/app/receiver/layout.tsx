'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Search,
  ClipboardList,
  MapPin,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Heart,
} from 'lucide-react';

const navItems = [
  { href: '/receiver/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/receiver/browse', label: 'Browse Food', icon: Search },
  { href: '/receiver/requests', label: 'My Requests', icon: ClipboardList },
  { href: '/receiver/map', label: 'Map View', icon: MapPin },
  { href: '/receiver/notifications', label: 'Notifications', icon: Bell },
  { href: '/receiver/profile', label: 'Profile', icon: User },
];

export default function ReceiverLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'receiver')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center animate-pulse">
            <Heart size={28} className="text-primary" />
          </div>
          <p className="text-gray-500 font-heading font-medium">Loading your portal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F9F7F4]">
      {/* ── Desktop Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-gray-50">
          <Link href="/receiver/dashboard" className="text-2xl font-heading font-extrabold text-primary">
            FoodShare
          </Link>
          <p className="text-[10px] text-gray-600 font-heading font-extrabold uppercase tracking-widest mt-1">
            Receiver Portal
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-primary font-heading font-extrabold text-sm shrink-0">
              {user.firstName?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-heading font-bold text-gray-800 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-gray-600 font-bold truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-grow p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-heading text-sm font-medium ${
                  active
                    ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-50">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-heading text-sm font-medium cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white z-40 flex flex-col shadow-2xl transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <Link href="/receiver/dashboard" className="text-xl font-heading font-extrabold text-primary">
            FoodShare
          </Link>
          <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-grow p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-heading text-sm font-medium ${
                  active
                    ? 'bg-primary text-white font-bold'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-50">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-heading text-sm font-medium cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-20 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:hidden shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-gray-500 hover:text-gray-900 cursor-pointer">
            <Menu size={22} />
          </button>
          <Link href="/receiver/dashboard" className="text-lg font-heading font-extrabold text-primary">
            FoodShare
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-heading font-extrabold text-xs">
            {user.firstName?.[0]?.toUpperCase()}
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
