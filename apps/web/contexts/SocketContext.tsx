'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3000/messages';

const getStoredToken = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return localStorage.getItem('accessToken');
};

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const isAuthenticatedRef = useRef(isAuthenticated);

    // Update ref when isAuthenticated changes
    useEffect(() => {
        isAuthenticatedRef.current = isAuthenticated;
    }, [isAuthenticated]);

    useEffect(() => {
        // Don't reconnect if already connected and auth state hasn't actually changed
        if (socketRef.current?.connected && isAuthenticated === isAuthenticatedRef.current) {
            return;
        }

        if (!isAuthenticated) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setSocket(null);
            setIsConnected(false);
            return;
        }

        const token = getStoredToken();
        if (!token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setSocket(null);
            setIsConnected(false);
            return;
        }

        // Only create new socket if we don't have one or it's disconnected
        if (!socketRef.current || !socketRef.current.connected) {
            const newSocket = io(SOCKET_URL, {
                auth: { token },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            newSocket.on('connect', () => {
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                setIsConnected(false);
            });

            newSocket.on('connect_error', () => {
                setIsConnected(false);
            });

            socketRef.current = newSocket;
            setSocket(newSocket);
        }

        return () => {
            // Only cleanup on unmount, not on every render
        };
    }, [isAuthenticated]);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        socket,
        isConnected,
    }), [socket, isConnected]);

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}
