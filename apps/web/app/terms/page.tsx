import { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TERMS_OF_SERVICE_AL, LAST_UPDATED_DATE } from '@/lib/legal-documents';

export default function TermsPage() {
    // Format markdown-like content for display
    const formatContent = (content: string) => {
        return content
            .split('\n')
            .map((line, index) => {
                // Headers
                if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-10 mb-6">{line.substring(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">{line.substring(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mt-6 mb-3">{line.substring(4)}</h3>;
                }
                // Bold text
                if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={index} className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white my-3">{line.substring(2, line.length - 2)}</p>;
                }
                // Empty lines
                if (line.trim() === '') {
                    return <br key={index} />;
                }
                // Regular paragraphs
                return <p key={index} className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed my-4">{line}</p>;
            });
    };

    return (
        <>
            <Suspense fallback={<div className="h-16 bg-white dark:bg-slate-900" />}>
                <Navbar />
            </Suspense>
            
            <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-12">
                        <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                E përditësuar: {LAST_UPDATED_DATE}
                            </p>
                        </div>
                        
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            {formatContent(TERMS_OF_SERVICE_AL)}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
