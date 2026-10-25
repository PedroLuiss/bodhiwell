import { useTranslation } from 'react-i18next';
import { useNews } from '../../../../hooks/useNews';

export const useNewsSection = () => {
  const { latestNews, loading, error } = useNews();
  const { t } = useTranslation();

  const cleanText = (html: string) => {
    if (!html) return '';
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const decoded = doc.body.textContent || "";
      const final = decoded.replace(/\[&hellip;\]/g, '...').trim();
      return final.length > 600 ? final.substring(0, 600) + '...' : final;
    } catch (e) {
      return html;
    }
  };

  const filteredNews = latestNews
    .filter(article => 
      (article.image || article.excerpt) && 
      (article.excerpt || article.date)
    )
    .slice(0, 2);

  return {
    latestNews: filteredNews,
    loading,
    error,
    t,
    cleanText
  };
};
