'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Bell, Check, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev: any) =>
        prev.map((n: any) => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-heading font-extrabold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500 mt-1 font-body">Stay updated on your donation activity.</p>
        </div>
        <div className="bg-primary-light p-3 rounded-2xl text-primary">
          <Bell size={28} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification: any) => (
            <div 
              key={notification._id} 
              className={`p-6 rounded-3xl border transition-all ${
                notification.isRead ? 'bg-white border-gray-100 opacity-75' : 'bg-primary-light/30 border-primary-light shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-xl mt-1 ${
                    notification.isRead ? 'bg-gray-100 text-gray-400' : 'bg-primary-light text-primary'
                  }`}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className={`font-heading font-bold text-lg ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 font-body mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-4 mt-4 text-xs font-heading font-bold uppercase tracking-widest text-gray-400">
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                      {notification.link && (
                        <Link 
                          href={notification.link} 
                          className="flex items-center text-primary hover:underline"
                        >
                          <ExternalLink size={12} className="mr-1" />
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                {!notification.isRead && (
                  <button 
                    onClick={() => markAsRead(notification._id)}
                    className="text-gray-400 hover:text-primary transition-colors"
                    title="Mark as read"
                  >
                    <Check size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Bell className="mx-auto h-12 w-12 text-gray-200 mb-4" />
          <p className="text-gray-500 font-heading font-bold">No notifications yet.</p>
        </div>
      )}
    </div>
  );
}
