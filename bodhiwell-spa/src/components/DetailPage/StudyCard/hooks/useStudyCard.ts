import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { profesionStudies } from '../../../../types';
import { formatDate } from '../../../../utils/formatDate';

export const useStudyCard = (
    study: profesionStudies,
    onViewCertificate: (url: string, name: string) => void,
    styles: { [key: string]: string }
) => {
    const { t, i18n } = useTranslation();

    const formattedDateRange = useMemo(() => {
        const start = study.date_start ? formatDate(study.date_start.slice(0, 10), i18n.language) : '';
        const end = study.date_end ? formatDate(study.date_end.slice(0, 10), i18n.language) : '';
        
        if (start && end) {
            return t('DetailPage.StudyCard.dateRange', { start, end, defaultValue: `${start} - ${end}` });
        }
        return start || end || '';
    }, [study.date_start, study.date_end, t, i18n.language]);

    const handleCertificateClick = useCallback(() => {
        if (study.url_certificate) {
            const url = `${process.env.REACT_APP_API_URL}${study.url_certificate}`;
            onViewCertificate(url, study.name || '');
        }
    }, [study.url_certificate, study.name, onViewCertificate]);

    const getBadgeClass = useCallback((slug?: string) => {
        if (!slug || !styles) return '';
        const baseClass = styles['study-card__badge'] || '';
        if (slug.includes('cuerpo')) return `${baseClass} ${styles['study-card__badge--cuerpo'] || ''}`;
        if (slug.includes('mente')) return `${baseClass} ${styles['study-card__badge--mente'] || ''}`;
        if (slug.includes('conciencia')) return `${baseClass} ${styles['study-card__badge--conciencia'] || ''}`;
        if (slug.includes('energia')) return `${baseClass} ${styles['study-card__badge--energia'] || ''}`;
        return baseClass;
    }, [styles]);

    return {
        t,
        formattedDateRange,
        getBadgeClass,
        handleCertificateClick
    };
};