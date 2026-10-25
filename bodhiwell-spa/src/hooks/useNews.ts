import { useState, useEffect } from 'react';
import { getNews } from '../services/newsService';
import { NewsItem } from '../types';

export const useNews = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const data = await getNews();
                setNews(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const latestNews = news.slice(0, 3);

    return { news, latestNews, loading, error };
};