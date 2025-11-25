'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Navbar } from '@/components/Navbar';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const loginMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const response = await api.post('/auth/login', data);
            return response.data;
        },
        onSuccess: (data) => {
            // Store tokens (API returns camelCase: accessToken, refreshToken)
            localStorage.setItem('accessToken', data.accessToken || data.access_token);
            localStorage.setItem('refreshToken', data.refreshToken || data.refresh_token);
            localStorage.setItem('userId', data.user.id);
            // Store user with role information
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirect admin users to admin dashboard
            if (data.user.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate(formData);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                Identifikohu
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                Hyni në llogarinë tuaj
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="label">Fjalëkalimi</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input"
                                    placeholder="••••••••"
                                />
                            </div>

                            {loginMutation.isError && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-sm border border-rose-200 dark:border-rose-800">
                                    Email ose fjalëkalim i gabuar
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="w-full btn-primary text-white"
                            >
                                {loginMutation.isPending ? 'Duke u identifikuar...' : 'Identifikohu'}
                            </button>
                        </form>

                        <div className="mt-6 text-center space-y-2">
                            <p className="text-slate-600 dark:text-slate-400">
                                Nuk keni llogari?{' '}
                                <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors">
                                    Regjistrohuni
                                </Link>
                            </p>
                            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 inline-block transition-colors">
                                ← Kthehu në faqen kryesore
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
