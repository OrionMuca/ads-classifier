'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { TermsPrivacyModal } from '@/components/TermsPrivacyModal';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        // Validate phone format before showing modal
        const normalizedPhone = formData.phone.replace(/\s+/g, '');
        const phonePattern = /^(\+355|0)[6-9]\d{8}$/;
        if (!phonePattern.test(normalizedPhone)) {
            setError('Numri i telefonit nuk është në formatin e saktë. Format: +355692345678 ose 0692345678');
            return;
        }
        
        // Show terms modal first
        setShowTermsModal(true);
    };

    const handleAcceptTerms = async () => {
        setShowTermsModal(false);
        
        // Now proceed with registration
        setIsLoading(true);
        
        try {
            // Normalize phone number before submission (remove spaces)
            const normalizedPhone = formData.phone.replace(/\s+/g, '');
            
            const registeredUser = await register(
                formData.email, 
                formData.password, 
                formData.name || undefined,
                normalizedPhone,
                true, // acceptedTerms
                true  // acceptedPrivacy
            );
            
            setAcceptedTerms(true);
            setAcceptedPrivacy(true);
            
            // Small delay to ensure AuthContext state is updated before redirect
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Redirect based on user role
            if (registeredUser?.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            const errorMessage = err?.message || err?.response?.data?.message || 'Gabim në regjistrim';
            setError(errorMessage);
            setIsLoading(false);
            // Reset acceptance if registration fails
            setAcceptedTerms(false);
            setAcceptedPrivacy(false);
        }
    };

    return (
        <>
            <Suspense fallback={<div className="h-16 bg-white dark:bg-slate-900" />}>
                <Navbar />
            </Suspense>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                Krijo Llogari
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                Regjistrohuni për të filluar
                            </p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-5">
                            <div>
                                <label className="label">Emri (opsional)</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    placeholder="Emri juaj"
                                />
                            </div>

                            <div>
                                <label className="label">Email *</label>
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
                                <label className="label">Numri i Telefonit *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => {
                                        // Allow user to type with spaces, but store without spaces for validation
                                        const value = e.target.value;
                                        setFormData({ ...formData, phone: value });
                                    }}
                                    onBlur={(e) => {
                                        // Normalize phone number on blur (remove spaces, keep + and digits)
                                        const normalized = e.target.value.replace(/\s+/g, '');
                                        setFormData({ ...formData, phone: normalized });
                                    }}
                                    className="input"
                                    placeholder="+355692345678 ose 0692345678"
                                    pattern="^(\+355|0)[6-9]\d{8}$"
                                    autoComplete="off"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Format: +355692345678 ose 0692345678 (pa hapësira)
                                </p>
                            </div>

                            <div>
                                <label className="label">Fjalëkalimi *</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input"
                                    placeholder="Minimum 8 karaktere"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                <p className="mb-2">
                                    Duke klikuar "Regjistrohu", ju pranoni{' '}
                                    <button
                                        type="button"
                                        onClick={() => setShowTermsModal(true)}
                                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium underline"
                                    >
                                        Kushtet e Shërbimit
                                    </button>
                                    {' '}dhe{' '}
                                    <button
                                        type="button"
                                        onClick={() => setShowTermsModal(true)}
                                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium underline"
                                    >
                                        Politiken e Privatësisë
                                    </button>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || showTermsModal}
                                className="w-full btn-primary text-white"
                            >
                                {isLoading ? 'Duke u regjistruar...' : 'Regjistrohu'}
                            </button>
                        </form>

                        <div className="mt-6 text-center space-y-2">
                            <p className="text-slate-600 dark:text-slate-400">
                                Keni llogari tashmë?{' '}
                                <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                                    Identifikohu
                                </Link>
                            </p>
                            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 inline-block">
                                ← Kthehu në faqen kryesore
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <TermsPrivacyModal
                isOpen={showTermsModal}
                onClose={() => {
                    // Allow the user to close the modal at any time;
                    // if they haven't accepted yet, registration simply won't continue.
                    setShowTermsModal(false);
                }}
                onAccept={handleAcceptTerms}
            />
        </>
    );
}
