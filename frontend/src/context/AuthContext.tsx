'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'donor' | 'receiver';
    organization?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const login = (token: string, userData: User) => {
        // Use role-specific token keys to allow multi-session testing
        const tokenKey = `token_${userData.role}`;
        localStorage.setItem(tokenKey, token);
        // Also set a generic token for simple requests if needed, 
        // but the API interceptor will prioritize the role-specific one
        localStorage.setItem('token', token);
        
        setUser(userData);
        if (userData.role === 'donor') {
            router.push('/donor/dashboard');
        } else {
            router.push('/receiver/dashboard');
        }
    };

    const logout = () => {
        if (user) {
            localStorage.removeItem(`token_${user.role}`);
        }
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    const checkAuth = async () => {
        // Detect role from path to find the right token
        const isDonorPath = window.location.pathname.startsWith('/donor');
        const isReceiverPath = window.location.pathname.startsWith('/receiver');
        
        let token = null;
        if (isDonorPath) token = localStorage.getItem('token_donor');
        else if (isReceiverPath) token = localStorage.getItem('token_receiver');
        
        if (!token) token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/users/profile');
            setUser(res.data.user);
        } catch (err) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
