import React from 'react';
import styles from './ProfessionalCard.module.scss';
import { useProfessionalCard } from './hooks/useProfessionalCard';
import { ProfessionalCardProps } from './types/Professional.types';
import { useTranslation } from 'react-i18next';

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional, uid }) => {
  const {
    isPlaying,
    videoData,
    dimColor,
    handleCardClick,
    handlePlayClick
  } = useProfessionalCard(professional, uid);

  const { isVideo, isEmbed, finalVideoUrl } = videoData;
  const { t } = useTranslation();

  return (
    <article 
      className={styles['grid-card']} 
      style={{ '--dimension-color': dimColor } as React.CSSProperties}
      onClick={handleCardClick}
    >
      <div 
        className={styles['grid-card__media']} 
        style={{ backgroundImage: isPlaying ? 'none' : `url(${professional.image})` }}
      >
        <div className={styles['grid-card__dimension-tag']}>
          {professional.dimension?.toUpperCase()}
        </div>

        {isVideo && isPlaying ? (
          <div className={styles['grid-card__video-container']}>
            {isEmbed ? (
              <iframe src={finalVideoUrl} frameBorder="0" allowFullScreen title="Video Profile" />
            ) : (
              <video src={finalVideoUrl} controls autoPlay onClick={(e) => e.stopPropagation()} />
            )}
          </div>
        ) : (
          isVideo && (
            <div className={styles['grid-card__play-overlay']} onClick={handlePlayClick}>
              <button className={styles['grid-card__play-btn']}>▶</button>
            </div>
          )
        )}
      </div>

      <div className={styles['grid-card__body']}>
        <div className={styles['grid-card__copy']}>
          <h3 className={styles['grid-card__name']}>{professional.name}</h3>
          <p className={styles['grid-card__role']}>{professional.specialty}</p>
          <span className={`${styles['grid-card__msp']} ${!professional.isMspVerified ? styles['grid-card__msp--hidden'] : ''}`}>
            MSP
          </span>
        </div>
        <button onClick={handleCardClick} className={styles['grid-card__cta']}>{t('landing.professionalsList.viewProfile', 'Ver perfil')}</button>
      </div>
    </article>
  );
};

export default ProfessionalCard;