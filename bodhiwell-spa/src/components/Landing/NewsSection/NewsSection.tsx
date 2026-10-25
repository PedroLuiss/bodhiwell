import React from 'react';
import styles from './NewsSection.module.scss';
import { useNewsSection } from './hooks/useNewsSection';
import ArticleCard from './ArticleCard/ArticleCard';

export const NewsSection: React.FC = () => {
  const { latestNews, loading, error, t, cleanText } = useNewsSection();
  if (loading || error || !latestNews || latestNews.length === 0) return null;

  return (
    <section className={styles['news-section']} id="blog">
      <div className={styles['news-section__container']}>
        <header className={styles['news-section__header']}>
          <p className={styles['news-section__eyebrow']}>
            {t('landing.news.eyebrow', 'Artículos')}
          </p>
          <h2 className={styles['news-section__title']}>
            {t('landing.news.title', 'Una base editorial para seguir ampliando la mirada')}
          </h2>
        </header>

        <div className={styles['news-section__grid']}>
          {latestNews.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              cleanText={cleanText} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};