import React, { useState, useMemo } from 'react';
import styles from './TruncatedHtmlContent.module.scss';
import { useTranslation } from 'react-i18next';

interface TruncatedHtmlContentProps {
  htmlContent: string;
  maxLength: number;
}

const TruncatedHtmlContent: React.FC<TruncatedHtmlContentProps> = ({ htmlContent, maxLength }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanHtml = useMemo(() => {
    if (!htmlContent) return '';
    return htmlContent.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
  }, [htmlContent]);

  const plainText = useMemo(() => {
    const div = document.createElement('div');
    div.innerHTML = cleanHtml;
    return div.textContent || div.innerText || '';
  }, [cleanHtml]);

  const isTruncatable = plainText.length > maxLength;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isTruncatable) {
    return (
      <div 
        className={styles.content} 
        dangerouslySetInnerHTML={{ __html: cleanHtml }} 
      />  
    );
  }

  return (
      <>
      <div
        className={`${styles.content} ${!isExpanded ? styles.truncated : ''}`}
        style={!isExpanded ? { overflow: 'hidden' } : {}}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
      <button onClick={toggleExpanded} type='button' className={styles.toggleButton}>
        {isExpanded ? t('landing.professionalInfo.readLess') : t('landing.professionalInfo.readMore')}
      </button>
      </>
  );
};

export default TruncatedHtmlContent;