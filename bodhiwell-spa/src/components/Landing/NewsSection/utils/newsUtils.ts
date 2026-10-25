import styles from '../NewsSection.module.scss';

/**
 * Helper to get the CSS class for a specific category
 */
export const getCategoryClass = (category: string): string => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('visión') || cat.includes('vision')) return styles['article-card__pill--vision'];
  if (cat.includes('cuerpo')) return styles['article-card__pill--cuerpo'];
  if (cat.includes('mente')) return styles['article-card__pill--mente'];
  if (cat.includes('energía') || cat.includes('energia')) return styles['article-card__pill--energia'];
  if (cat.includes('conciencia')) return styles['article-card__pill--conciencia'];
  return styles['article-card__pill--vision'];
};
