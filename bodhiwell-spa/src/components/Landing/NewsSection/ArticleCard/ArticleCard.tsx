import React, { memo, useMemo } from 'react';
import styles from '../NewsSection.module.scss';
import dayjs from 'dayjs';
import PLACEHOLDER_IMAGE from '../../../../assets/images/plaholderprofilewhite.png';
import { NewsItem } from '../../../../types';
import { getCategoryClass } from '../utils/newsUtils';
import { useTranslation } from 'react-i18next';

interface ArticleCardProps {
  article: NewsItem;
  cleanText: (text: string) => string;
}

const ArticleCard: React.FC<ArticleCardProps> = memo(({ article, cleanText }) => {
  const { t } = useTranslation();
  const description = useMemo(() => cleanText(article.excerpt), [article.excerpt, cleanText]);
  const formattedDate = useMemo(() => dayjs(article.date).format('D MMMM YYYY'), [article.date]);
  const categoryKey = useMemo(() => {
    const cat = article.category?.toLowerCase() || '';
    if (cat.includes('visión') || cat.includes('vision')) return 'vision';
    if (cat.includes('cuerpo')) return 'cuerpo';
    if (cat.includes('mente')) return 'mente';
    if (cat.includes('energía') || cat.includes('energia')) return 'energia';
    if (cat.includes('conciencia')) return 'conciencia';
    return '';
  }, [article.category]);

  const translatedCategory = categoryKey ? t(`landing.news.categories.${categoryKey}`) : (article.category || t('landing.news.tag', 'Lectura'));
  const categoryClass = useMemo(() => getCategoryClass(article.category), [article.category]);
  const imageUrl = typeof article.image === 'string' ? article.image : PLACEHOLDER_IMAGE;

  return (
    <article className={styles['article-card']}>
      <a 
        href={article.link} 
        className={styles['article-card__media']}
        target="_blank" 
        rel="noopener noreferrer"
      >
        <img 
          src={imageUrl} 
          alt={article.title} 
          className={styles['article-card__image']} 
          loading="lazy"
        />
      </a>
      
      <div className={styles['article-card__body']}>
        <span className={`${styles['article-card__pill']} ${categoryClass}`}>
          {translatedCategory}
        </span>

        <h3 className={styles['article-card__title']}>
          <a href={article.link} target="_blank" rel="noopener noreferrer">
              {article.title}
          </a>
        </h3>

        <p className={styles['article-card__excerpt']}>{description}</p>
        
        <div className={styles['article-card__meta']}>
          <span>{formattedDate}</span>
          <span>{t('landing.news.readingTime', 'Lectura')}</span>
        </div>

        <div className={styles['article-card__link-row']}>
          <a 
            href={article.link} 
            className={styles['article-card__link']} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {t('landing.news.readMore', 'Leer artículo')}
          </a>
        </div>
      </div>
    </article>
  );
});

ArticleCard.displayName = 'ArticleCard';

export default ArticleCard;
