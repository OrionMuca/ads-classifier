'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TERMS_OF_SERVICE_AL, PRIVACY_POLICY_AL } from '@/lib/legal-documents';

interface TermsPrivacyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
}

type TabType = 'terms' | 'privacy';

export function TermsPrivacyModal({ isOpen, onClose, onAccept }: TermsPrivacyModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('terms');
    const [termsScrolled, setTermsScrolled] = useState(false);
    const [privacyScrolled, setPrivacyScrolled] = useState(false);
    
    const termsContentRef = useRef<HTMLDivElement>(null);
    const privacyContentRef = useRef<HTMLDivElement>(null);

    // Reset scroll states when modal opens/closes or tab changes
    useEffect(() => {
        if (isOpen) {
            setTermsScrolled(false);
            setPrivacyScrolled(false);
        }
    }, [isOpen]);

    // Check scroll position for terms
    const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isAtBottom = 
            target.scrollHeight - target.scrollTop <= target.clientHeight + 10; // 10px threshold

        // Once the user has scrolled to the bottom at least once,
        // keep the "read" state even if they scroll slightly back up.
        if (isAtBottom && !termsScrolled) {
            setTermsScrolled(true);
        }
    };

    // Check scroll position for privacy
    const handlePrivacyScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isAtBottom = 
            target.scrollHeight - target.scrollTop <= target.clientHeight + 10; // 10px threshold

        // Once the user has scrolled to the bottom at least once,
        // keep the "read" state even if they scroll slightly back up.
        if (isAtBottom && !privacyScrolled) {
            setPrivacyScrolled(true);
        }
    };

    // Check if both documents are scrolled
    const canAccept = termsScrolled && privacyScrolled;

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle ESC key - removed alert, modal can be closed freely

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            // Allow closing the modal without forcing acceptance.
            onClose();
        }
    };

    const handleAccept = () => {
        if (canAccept) {
            onAccept();
        }
    };

    // Format markdown-like content for display
    // Basic formatter for markdown-like content, including inline bold.
    const formatContent = (content: string) => {
        const renderInline = (text: string) => {
            // Handle **bold** segments inside a line
            const parts = text.split(/(\*\*[^*]+\*\*)/g);
            return parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                return part;
            });
        };

        return content
            .split('\n')
            .map((line, index) => {
                // Headers
                if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-8 mb-4">{line.substring(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mt-6 mb-3">{line.substring(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mt-4 mb-2">{line.substring(4)}</h3>;
                }
                // Full-line bold text
                if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                        <p key={index} className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white my-2">
                            {renderInline(line.substring(2, line.length - 2))}
                        </p>
                    );
                }
                // List items
                if (line.trim().startsWith('- ')) {
                    return (
                        <p key={index} className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed my-1 pl-4">
                            • {renderInline(line.trim().substring(2))}
                        </p>
                    );
                }
                // Empty lines
                if (line.trim() === '') {
                    return <br key={index} />;
                }
                // Regular paragraphs
                return (
                    <p key={index} className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed my-3">
                        {renderInline(line)}
                    </p>
                );
            });
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
                onClick={handleBackdropClick}
            />
            
            {/* Modal - Mobile: Full screen, Desktop: Centered */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
                <div className="w-full h-full md:w-full md:max-w-4xl md:max-h-[90vh] bg-white dark:bg-slate-900 md:rounded-lg shadow-xl flex flex-col">
                    {/* Header - Sticky */}
                    <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 z-10">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                Kushtet dhe Politika e Privatësisë
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                aria-label="Mbyll"
                            >
                                <XMarkIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setActiveTab('terms')}
                                className={`flex-1 py-2 px-4 text-sm sm:text-base font-medium transition-colors ${
                                    activeTab === 'terms'
                                        ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                Kushtet e Shërbimit
                            </button>
                            <button
                                onClick={() => setActiveTab('privacy')}
                                className={`flex-1 py-2 px-4 text-sm sm:text-base font-medium transition-colors ${
                                    activeTab === 'privacy'
                                        ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                Politika e Privatësisë
                            </button>
                        </div>
                    </div>

                    {/* Content - Scrollable */}
                    <div 
                        ref={activeTab === 'terms' ? termsContentRef : privacyContentRef}
                        onScroll={activeTab === 'terms' ? handleTermsScroll : handlePrivacyScroll}
                        className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
                    >
                        <div className="max-w-none prose prose-slate dark:prose-invert">
                            {activeTab === 'terms' ? (
                                <div className="space-y-4">
                                    {formatContent(TERMS_OF_SERVICE_AL)}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formatContent(PRIVACY_POLICY_AL)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer - Sticky */}
                    <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-4">
                        {/* Scroll indicator */}
                        {!canAccept && (
                            <div className="mb-3 text-center">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {activeTab === 'terms' && !termsScrolled && 'Ju lutem scrolloni në fund të Kushteve të Shërbimit'}
                                    {activeTab === 'privacy' && !privacyScrolled && 'Ju lutem scrolloni në fund të Politikës së Privatësisë'}
                                    {((activeTab === 'terms' && termsScrolled) || (activeTab === 'privacy' && privacyScrolled)) && 
                                     !canAccept && 'Ju lutem lexoni dhe scrolloni në fund të të dy dokumenteve'}
                                </p>
                            </div>
                        )}
                        
                        {/* Progress indicator */}
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-300"
                                    style={{ width: `${((termsScrolled ? 1 : 0) + (privacyScrolled ? 1 : 0)) * 50}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                                {((termsScrolled ? 1 : 0) + (privacyScrolled ? 1 : 0))}/2
                            </span>
                        </div>

                        {/* Accept Button */}
                        <button
                            onClick={handleAccept}
                            disabled={!canAccept}
                            className={`w-full py-3 px-6 text-base font-medium rounded-lg transition-all ${
                                canAccept
                                    ? 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white cursor-pointer'
                                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {canAccept ? 'Prano dhe Vazhdo' : 'Priteni, ju lutem lexoni dokumentet'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
