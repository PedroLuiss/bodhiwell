import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfessionals } from '../../../hooks/useProfessional';
import { useProfessionalsCarousel } from './hooks/useProfessionalsCarousel';
import styles from './ProfessionalsSection.module.scss';
import { DIMENSION_COLORS } from './constant/ProfessionalsSection.constant';

export const ProfessionalsSection: React.FC = () => {
    const { featuredProfessionals, loading } = useProfessionals();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { 
        trackRef, activePage, pageCount, canPrev, canNext, 
        scroll, goToPage, updateState 
    } = useProfessionalsCarousel(featuredProfessionals.length);

    return (
        <section className={styles['pros-section']} id="community">
            {!loading && (
                <div className={styles['pros-section__card']}>
                    <p className={styles['pros-section__eyebrow']}>
                        {t('landing.professionalsSection.eyebrow', 'VOCACIÓN')}
                    </p>
                    
                    <h2 className={styles['pros-section__title']}>
                        <span className={styles['pros-section__title-line']}>{t('landing.professionalsSection.titleLine1', 'Profesionales que acompañan')}</span>
                        <span className={styles['pros-section__title-line']}>{t('landing.professionalsSection.titleLine2', 'con propósito')}</span>
                    </h2>

                    <p className={styles['pros-section__copy']}>
                        {t('landing.professionalsSection.description', 'Cada profesional en esta plataforma comparte una mirada integradora, con formación sólida y compromiso humano. Podés explorar sus perfiles y descubrir quién puede acompañarte en este momento de tu camino.')}
                    </p>

                    <div className={styles['pros-section__action-row']}>
                        <button 
                            onClick={() => navigate("/professionals")} 
                            className={styles['pros-section__btn-secondary']}
                        >
                            {t('landing.professionalsSection.cta', 'Conocer a los profesionales')}
                        </button>
                    </div>

                    <div className={styles['pros-section__carousel']}>
                        <button 
                            className={`${styles['pros-section__arrow']} ${styles['pros-section__arrow--left']}`}
                            onClick={() => scroll('prev')}
                            disabled={!canPrev}
                            aria-label="Anterior"
                        >
                            ‹
                        </button>

                        <div 
                            className={styles['pros-section__track']} 
                            ref={trackRef}
                            onScroll={updateState}
                        >
                            {featuredProfessionals.map((prof) => (
                                <article 
                                    key={prof.uid} 
                                    className={styles['pros-section__pro-card']}
                                    onClick={() => navigate(`/professionals/${prof.uid}`)}
                                    style={{ '--dimension-color': DIMENSION_COLORS[prof.dimensionName?.toLowerCase() || 'cuerpo'] } as React.CSSProperties}
                                >
                                    <div className={`${styles['pros-section__dim-tag']} ${styles['pros-section__dim-tag--' + (prof.dimensionName?.toLowerCase() || 'cuerpo')]}`}>
                                        {prof.dimensionName?.toUpperCase()}
                                    </div>
                                    
                                    <div 
                                        className={styles['pros-section__pro-media']}
                                        style={{ backgroundImage: `url(${prof.imageUrl})` }}
                                    />

                                    <div className={styles['pros-section__pro-overlay']}>
                                        <div className={styles['pros-section__pro-copy']}>
                                            <p className={styles['pros-section__pro-name']}>{prof.fullName}</p>
                                            <p className={styles['pros-section__pro-role']}>{prof.professionName}</p>
                                            <span className={`${styles['pros-section__msp-badge']} ${!prof.hasMsp ? styles['pros-section__msp-badge--hidden'] : ''}`}>
                                                MSP
                                            </span>
                                        </div>
                                        <button 
                                            className={styles['pros-section__card-cta']}
                                            onClick={() => navigate(`/professionals/${prof.uid}`)}
                                        >
                                            {t('landing.professionalsSection.viewProfile', 'Ver perfil')}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <button 
                            className={`${styles['pros-section__arrow']} ${styles['pros-section__arrow--right']}`}
                            onClick={() => scroll('next')}
                            disabled={!canNext}
                            aria-label="Siguiente"
                        >
                            ›
                        </button>

                        <div className={styles['pros-section__dots']}>
                            {Array.from({ length: pageCount }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`${styles['pros-section__dot']} ${i === activePage ? styles['pros-section__dot--active'] : ''}`}
                                    onClick={() => goToPage(i)}
                                    aria-label={`Ir a página ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};