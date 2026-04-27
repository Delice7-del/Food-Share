'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Info, 
  MoreVertical, 
  Trash2, 
  CheckCheck
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
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
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map((n: any) => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n: any) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n: any) => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-gray-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-gray-500 mt-1">Stay updated with your requests and nearby activities.</p>
        </div>
        {notifications.some((n: any) => !n.isRead) && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-primary font-heading font-bold text-sm hover:underline"
          >
            <CheckCheck size={18} />
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification: any) => (
            <div 
              key={notification._id} 
              className={`card flex gap-4 transition-all duration-300 ${
                !notification.isRead ? 'border-l-4 border-l-primary bg-primary/5 shadow-md' : 'opacity-80'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                notification.type === 'request_accepted' ? 'bg-green-100 text-green-600' :
                notification.type === 'request_rejected' ? 'bg-red-100 text-red-600' :
                'bg-primary-light/20 text-primary'
              }`}>
                {notification.type === 'request_accepted' ? <CheckCircle2 size={24} /> :
                 notification.type === 'request_rejected' ? <XCircle size={24} /> :
                 <Info size={24} />}
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-heading font-bold text-gray-900 ${!notification.isRead ? 'text-lg' : 'text-base'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {notification.message}
                </p>
                
                {!notification.isRead && (
                  <button 
                    onClick={() => markAsRead(notification._id)}
                    className="mt-3 text-xs font-heading font-extrabold text-primary uppercase tracking-wider hover:underline"
                  >
                    Mark as Read
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => deleteNotification(notification._id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="h-10 w-10 text-gray-200" />
          </div>
          <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            You don't have any new notifications at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
