'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Bell, CheckCircle2, MessageSquare, Info, X } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
}

interface SocketContextType {
    socket: Socket | null;
    notifications: Notification[];
    removeNotification: (id: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (user && !socketRef.current) {
            // In development, the backend usually runs on a different port
            const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
            
            const newSocket = io(socketUrl, {
                query: { userId: user.id }
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('notification', (data: any) => {
                const newNotif = {
                    id: Math.random().toString(36).substr(2, 9),
                    title: data.title,
                    message: data.message,
                    type: data.type
                };
                setNotifications(prev => [newNotif, ...prev]);
                
                // Auto remove after 5 seconds
                setTimeout(() => {
                    removeNotification(newNotif.id);
                }, 5000);
            });

            socketRef.current = newSocket;
            setSocket(newSocket);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, [user]);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <SocketContext.Provider value={{ socket, notifications, removeNotification }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {notifications.map((notif) => (
                    <div 
                        key={notif.id}
                        className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-start gap-4 animate-slide-up"
                    >
                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                            notif.type.includes('accepted') ? 'bg-green-50 text-green-600' :
                            notif.type.includes('received') ? 'bg-amber-50 text-amber-600' : 'bg-primary-light text-primary'
                        }`}>
                            {notif.type.includes('accepted') ? <CheckCircle2 size={20} /> :
                             notif.type.includes('received') ? <MessageSquare size={20} /> : <Info size={20} />}
                        </div>
                        <div className="flex-grow min-w-0">
                            <h4 className="font-heading font-bold text-sm text-gray-900 truncate">{notif.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                        </div>
                        <button 
                            onClick={() => removeNotification(notif.id)}
                            className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
