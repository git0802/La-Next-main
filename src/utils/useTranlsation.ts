import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';

export const useCustomTranslation = () => {
    const router = useRouter();
    const { i18n } = useTranslation();
    const { t } = useTranslation();

    useEffect(() => {
        i18n.changeLanguage(router.locale ?? "en");
    }, [router.locale, i18n]);

    return { t };
};