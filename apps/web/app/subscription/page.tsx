'use client';

import { useState, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useToast } from '@/components/admin/Toast';
import { CheckIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

interface Plan {
    plan: string;
    name: string;
    price: number;
    maxPosts: number;
    maxImagesPerPost: number;
    features: string[];
}

export default function SubscriptionPage() {
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Fetch available plans
    const { data: plans } = useQuery({
        queryKey: ['subscription-plans'],
        queryFn: async () => {
            const response = await api.get('/subscription/plans');
            return response.data;
        },
    });

    // Fetch user's current subscription
    const { data: mySubscription } = useQuery({
        queryKey: ['my-subscription'],
        queryFn: async () => {
            const response = await api.get('/subscription/my-subscription');
            return response.data;
        },
        enabled: isAuthenticated,
    });

    // Request upgrade
    const requestMutation = useMutation({
        mutationFn: async ({ plan, notes }: { plan: string; notes?: string }) => {
            await api.post('/subscription/request', { plan, notes });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
            setShowModal(false);
            setSelectedPlan(null);
            setNotes('');
            showToast('Kërkesa juaj u dërgua me sukses! Administratori do ta shqyrtojë së shpejti.', 'success');
        },
    });

    const handleRequestUpgrade = (planName: string) => {
        setSelectedPlan(planName);
        setShowModal(true);
    };

    return (
        <>
            <Suspense fallback={<div className="h-16 bg-white dark:bg-slate-900" />}>
                <Navbar />
            </Suspense>
            <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Zgjidhni Planin Tuaj
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Përmirësoni planin tuaj për të postuar më shumë produkte
                        </p>
                    </div>

                    {/* Current Plan */}
                    {mySubscription && (
                        <div className="mb-12 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                                Plani Juaj Aktual
                            </h2>
                            <p className="text-primary-700 dark:text-primary-300">
                                {mySubscription.planConfig?.name} - {mySubscription.activePostsCount} / {mySubscription.planConfig?.maxPosts} postime aktive
                            </p>
                        </div>
                    )}

                    {/* Plans Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans?.map((plan: Plan) => {
                            const isCurrent = mySubscription?.subscription === plan.plan;
                            const canUpgrade = !isCurrent;

                            return (
                                <div
                                    key={plan.plan}
                                    className={`relative bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden border-2 ${
                                        isCurrent
                                            ? 'border-primary-500'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    {isCurrent && (
                                        <div className="absolute top-0 right-0 bg-primary-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                                            Plani Aktual
                                        </div>
                                    )}

                                    <div className="p-8">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                            {plan.name}
                                        </h3>
                                        <div className="mb-6">
                                            <span className="text-4xl font-bold text-slate-900 dark:text-white">
                                                {plan.price === 0 ? 'Falas' : `${plan.price} ALL`}
                                            </span>
                                            {plan.price > 0 && (
                                                <span className="text-slate-600 dark:text-slate-400 ml-2">
                                                    / 30 ditë
                                                </span>
                                            )}
                                        </div>

                                        <ul className="space-y-3 mb-8">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span className="text-slate-700 dark:text-slate-300">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        {canUpgrade ? (
                                            <button
                                                onClick={() => handleRequestUpgrade(plan.plan)}
                                                className="w-full btn-primary"
                                            >
                                                Kërko Përmirësim
                                            </button>
                                        ) : (
                                            <button disabled className="w-full btn-secondary opacity-50 cursor-not-allowed">
                                                Plani Aktual
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Payment Note */}
                    <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                            Mënyra e Pagesës
                        </h3>
                        <p className="text-yellow-700 dark:text-yellow-300">
                            Pagesa bëhet fizikisht. Pasi të dërgoni kërkesën, administratori do t'ju kontaktojë për detajet e pagesës. Pas konfirmimit të pagesës, plani juaj do të aktivizohet.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Request Modal */}
            {showModal && selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Kërko Përmirësim Plani
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Plani: <strong>{plans?.find((p: Plan) => p.plan === selectedPlan)?.name}</strong>
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Shënim (opsional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="P.sh. Do ta paguaj nesër..."
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedPlan(null);
                                    setNotes('');
                                }}
                                className="btn-secondary"
                            >
                                Anulo
                            </button>
                            <button
                                onClick={() => requestMutation.mutate({ plan: selectedPlan, notes })}
                                disabled={requestMutation.isPending}
                                className="btn-primary"
                            >
                                Dërgo Kërkesën
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
