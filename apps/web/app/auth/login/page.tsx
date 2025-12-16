'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const loggedInUser = await login(formData.email, formData.password);
            // Small delay to ensure AuthContext state is updated before redirect
            await new Promise(resolve => setTimeout(resolve, 100));
            // Redirect based on user role from login response
            if (loggedInUser?.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            // Use error message from context if available, otherwise default message
            const errorMessage = err?.message || err?.response?.data?.message || 'Email ose fjalëkalim i gabuar';
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <>
            <Suspense fallback={<div className="h-16 bg-white dark:bg-slate-900" />}>
                <Navbar />
            </Suspense>
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

                            {error && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-sm border border-rose-200 dark:border-rose-800">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary text-white"
                            >
                                {isLoading ? 'Duke u identifikuar...' : 'Identifikohu'}
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
