'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Trash2, 
  CheckCheck,
  MessageSquare,
  Package
} from 'lucide-react';

export default function DonorNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n: any) => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'request_received': return <MessageSquare className="text-amber-500" size={20} />;
      case 'request_accepted': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'request_rejected': return <XCircle className="text-red-500" size={20} />;
      case 'donation_expired': return <Info className="text-gray-500" size={20} />;
      default: return <Bell className="text-primary" size={20} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-gray-500 mt-1">Stay updated on your food donations and requests.</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm font-heading font-bold text-primary hover:text-primary-hover transition-colors"
          >
            <CheckCheck size={18} />
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif: any) => (
            <div 
              key={notif._id} 
              className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all hover:shadow-md ${
                notif.read ? 'bg-white border-gray-100 opacity-75' : 'bg-white border-primary/20 shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                notif.read ? 'bg-gray-50' : 'bg-primary-light/50'
              }`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-grow min-w-0">
                <h4 className={`font-heading font-bold text-sm ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                  {notif.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.message}</p>
                <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                   <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                   <span>•</span>
                   <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <button 
                onClick={() => deleteNotification(notif._id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="h-12 w-12 text-gray-200" />
          </div>
          <h3 className="text-2xl font-heading font-extrabold text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            When you receive new requests or updates, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
