import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { TranslationContextValue } from '@/utils/types';

// Create the TranslationContext
const TranslationContext = createContext<TranslationContextValue | null>(null);

export function useTranslationContext() {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslationContext must be used within a TranslationProvider');
    }
    return context;
}

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const { i18n } = useTranslation();
    const { t } = useTranslation();

    useEffect(() => {
        i18n.changeLanguage(router.locale ?? 'en');
    }, [router.locale, i18n]);

    // Use useMemo to optimize the creation of contextValue
    const contextValue = useMemo(() => {
        return {
            t,
        };
    }, [t]);

    return (
        <TranslationContext.Provider value={contextValue}>
            {children}
        </TranslationContext.Provider>
    );
};