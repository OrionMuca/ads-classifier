'use client';

import React, { useEffect, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: CheckCircleIcon,
        error: ExclamationCircleIcon,
        info: InformationCircleIcon,
        warning: ExclamationCircleIcon,
    };

    const colors = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    };

    const Icon = icons[type];

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-in slide-in-from-top-2 fade-in ${colors[type]}`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
            >
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    );
}

// Toast manager hook
let toastListeners: Array<(toast: { message: string; type: ToastType } | null) => void> = [];

export function showToast(message: string, type: ToastType = 'info') {
    toastListeners.forEach(listener => listener({ message, type }));
}

export function useToast() {
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    useEffect(() => {
        const listener = (newToast: { message: string; type: ToastType } | null) => {
            setToast(newToast);
        };
        toastListeners.push(listener);

        return () => {
            toastListeners = toastListeners.filter(l => l !== listener);
        };
    }, []);

    return {
        toast,
        showToast: (message: string, type: ToastType = 'info') => {
            setToast({ message, type });
        },
        hideToast: () => setToast(null),
    };
}

