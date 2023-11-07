import { useRouter } from 'next/router';
import { useTranslation } from 'next-export-i18n';
import { useEffect } from 'react';

export const useCustomTranslation = () => {
    const router = useRouter();
    const { i18n } = useTranslation();
    const { t } = useTranslation();

    useEffect(() => {
        i18n?.changeLanguage(router.locale ?? "de");
    }, [router, i18n]);

    return { t };
};