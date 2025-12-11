'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';

interface ContactSellerModalProps {
    isOpen: boolean;
    onClose: () => void;
    seller: {
        name: string;
        email: string;
        phone?: string;
        profile?: {
            whatsapp?: string;
            instagram?: string;
        };
    };
    productTitle: string;
}

export function ContactSellerModal({ isOpen, onClose, seller, productTitle }: ContactSellerModalProps) {
    const hasPhone = seller.phone || seller.profile?.whatsapp;
    const hasWhatsApp = seller.profile?.whatsapp;
    const hasInstagram = seller.profile?.instagram;
    const hasAnyContact = hasPhone || hasWhatsApp || hasInstagram;

    const formatPhoneForWhatsApp = (phone: string) => {
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');
        // If it doesn't start with country code, assume Albania (+355)
        if (!cleaned.startsWith('355')) {
            return '355' + cleaned;
        }
        return cleaned;
    };

    const getWhatsAppLink = () => {
        const phone = seller.profile?.whatsapp || seller.phone;
        if (!phone) return '';
        const formattedPhone = formatPhoneForWhatsApp(phone);
        const message = encodeURIComponent(`Hi! I'm interested in: ${productTitle}`);
        return `https://wa.me/${formattedPhone}?text=${message}`;
    };

    const getPhoneLink = () => {
        const phone = seller.phone || seller.profile?.whatsapp;
        if (!phone) return '';
        return `tel:${phone}`;
    };

    const getInstagramLink = () => {
        if (!seller.profile?.instagram) return '';
        const username = seller.profile.instagram.replace('@', '');
        return `https://instagram.com/${username}`;
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-xl font-semibold text-slate-900 dark:text-white mb-1"
                                        >
                                            Contact Seller
                                        </Dialog.Title>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {seller.name}
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                {hasAnyContact ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                            Choose how you'd like to contact the seller:
                                        </p>

                                        {/* WhatsApp */}
                                        {hasWhatsApp && (
                                            <a
                                                href={getWhatsAppLink()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 w-full p-4 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                                            >
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                                    <FaWhatsapp className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white">
                                                        WhatsApp
                                                    </h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {seller.profile?.whatsapp}
                                                    </p>
                                                </div>
                                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" />
                                            </a>
                                        )}

                                        {/* Phone Call */}
                                        {hasPhone && (
                                            <a
                                                href={getPhoneLink()}
                                                className="flex items-center gap-3 w-full p-4 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                                            >
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                    <PhoneIcon className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white">
                                                        Call
                                                    </h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {seller.phone || seller.profile?.whatsapp}
                                                    </p>
                                                </div>
                                                <PhoneIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform" />
                                            </a>
                                        )}

                                        {/* Instagram */}
                                        {hasInstagram && (
                                            <a
                                                href={getInstagramLink()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 w-full p-4 rounded-lg border-2 border-pink-500 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors group"
                                            >
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                                                    <FaInstagram className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white">
                                                        Instagram
                                                    </h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {seller.profile?.instagram}
                                                    </p>
                                                </div>
                                                <FaInstagram className="w-5 h-5 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform" />
                                            </a>
                                        )}

                                        {/* Email Fallback */}
                                        <a
                                            href={`mailto:${seller.email}?subject=Interested in: ${encodeURIComponent(productTitle)}`}
                                            className="flex items-center gap-3 w-full p-4 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-900/30 transition-colors group"
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center">
                                                <svg
                                                    className="w-6 h-6 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                                    Email
                                                </h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                                    {seller.email}
                                                </p>
                                            </div>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <PhoneIcon className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                                            The seller hasn't added contact information yet.
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-500">
                                            You can reach them via email:
                                        </p>
                                        <a
                                            href={`mailto:${seller.email}?subject=Interested in: ${encodeURIComponent(productTitle)}`}
                                            className="mt-3 inline-block btn-primary"
                                        >
                                            Send Email
                                        </a>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                        💡 Stay safe: Meet in public places and verify items before payment
                                    </p>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
