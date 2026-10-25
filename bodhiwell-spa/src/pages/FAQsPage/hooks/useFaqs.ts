import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getFaqs } from '../../../services/faqsService';
import { FaqGroup } from '../../../components/Landing/FAQsPage/FaqLayout/types';

export const useFaqs = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<FaqGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                setLoading(true);
                const result = await getFaqs();
                const translatedData = result.map(group => ({
                    ...group,
                    title: t(group.title),
                    intro: t(group.intro),
                    items: group.items.map(item => ({
                        q: t(item.q),
                        a: t(item.a)
                    }))
                }));

                setData(translatedData);
            } catch (err) {
                setError('Error al cargar las preguntas frecuentes');
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, [t]);

    return { data, loading, error };
};
