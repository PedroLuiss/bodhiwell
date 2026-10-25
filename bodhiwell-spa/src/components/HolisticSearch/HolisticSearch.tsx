import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './HolisticSearch.module.scss';
import { useHolisticSearch } from './hooks/useHolisticSearch';

import florVideo from '../../assets/videos/Search/flor.webm';
import florProRes from '../../assets/videos/Search/flor_safari_hevc.mp4';
import florFallback from '../../assets/images/Search/flor.png';
import { PETALS_DATA } from './constant/HolisticSearch.constant';
import { isSafari } from './utils/searchUtils';

export const HolisticSearch: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { t, i18n } = useTranslation();
    const {
        filters, selectedDim, hoveredDimName, tooltipPos, isVideoEnded,
        currentDimData, sortedEspecialidades, isNoMatch,
        setIsVideoEnded, handleInputChange, handlePetalClick,
        handleTagClick, handleMouseMove, handleMouseLeave,
        suggestedTop, applyFiltersSearch, resetSearch, searchPlaceholder, stageSubtitle
    } = useHolisticSearch();

    const [safari, setSafari] = useState<boolean>(false);

    useEffect(() => {
        setSafari(isSafari());
    }, []);

    return (
        <section className={`${styles['bw-search-container']} ${className}`} id="search-section" key={i18n.language}>
            <div
                className={`${styles['bw-search-container__float-tip']} ${hoveredDimName ? styles['bw-search-container__float-tip--visible'] : ''}`}
                style={{ left: tooltipPos.x, top: tooltipPos.y }}
            >
                {hoveredDimName}
            </div>

            <div className={styles['bw-search-container__bw-left']} onClick={resetSearch}>
                <div className={styles['bw-search-container__bw-left__inner']}>
                    <h1 className={styles['bw-search-container__bw-left__title']} data-no-animate>
                        <span>{t('HolisticSearch.title', 'Explorá una')}</span>  <span>{t('HolisticSearch.title_part2', 'dimensión')}</span>
                    </h1>
                    <p className={styles['bw-search-container__bw-left__sub']}>
                        {t('HolisticSearch.subtitle', 'Cuerpo, mente, energía o conciencia.')}
                        <br />
                        {t('HolisticSearch.subtitle_part2', 'Todo está conectado. Empezá por donde lo sientas.')}

                    </p>
                </div>
            </div>

            <div className={styles['bw-search-container__bw-center']} >
                <img
                    src={florFallback}
                    className={styles['bw-search-container__bw-center__media']}
                    alt="Bodhiwell"
                    onClick={resetSearch}
                    style={{ zIndex: 1, opacity: isVideoEnded ? 1 : 0 }}
                />
                <video
                    className={`${styles['bw-search-container__bw-center__media']} ${safari ? styles['bw-search-container__bw-center__media--safari-video'] : ''}`}
                    muted
                    playsInline
                    autoPlay
                    preload="auto"
                    onEnded={() => setIsVideoEnded(true)}
                    style={{
                        opacity: isVideoEnded ? 0 : 1,
                        zIndex: 2,
                        pointerEvents: isVideoEnded ? 'none' : 'auto',
                        transition: 'opacity 0.5s ease',
                    }}
                >
                    <source src={florProRes} type='video/mp4; codecs="hvc1"' />
                    <source src={florVideo} type="video/webm" />
                </video>

                <div className={styles['bw-search-container__bw-center__svg-wrap']}>
                    <svg viewBox="0 0 533.33 533.33">
                        <g transform="matrix(1.33, 0, 0, -1.33, 0, 533.33)">
                            <g clipPath="url(#clipPath16)">
                                {PETALS_DATA.map((petal) => (
                                    <g key={petal.id} transform={petal.transform}>
                                        <path
                                            id={petal.id}
                                            className={`
                                                ${styles['bw-search-container__bw-petal']} 
                                                ${selectedDim === petal.dim ? styles['bw-search-container__bw-petal--active'] : ''}
                                                ${!isVideoEnded ? styles['bw-search-container__bw-petal--video-playing'] : ''}
                                            `}
                                            d={petal.d}
                                            onClick={() => handlePetalClick(petal.dim)}
                                            onTouchStart={(e) => {
                                                e.preventDefault();
                                                handlePetalClick(petal.dim);
                                            }}
                                            onMouseMove={(e) => handleMouseMove(e, petal.dim)}
                                            onMouseLeave={handleMouseLeave}
                                            tabIndex={0}
                                            role="button"
                                        />
                                    </g>
                                ))}
                            </g>
                        </g>
                    </svg>
                </div>
            </div>

            <div className={styles['bw-search-container__bw-right']}>
                <div className={styles['bw-search-container__bw-right__inner']}>

                    <div className={styles['bw-search-container__bw-search']}>
                        <input
                            type="text"
                            placeholder={searchPlaceholder || "¿Qué sentís que necesitás hoy?"}
                            value={filters.q}
                            onChange={handleInputChange}
                            onKeyDown={(e) => e.key === 'Enter' && applyFiltersSearch()}
                        />
                        <button className={styles['bw-search-container__bw-infield-btn']} onClick={applyFiltersSearch} aria-label="Buscar">
                            <svg viewBox="0 0 24 24"><path d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0-4.243-1.757A6 6 0 0 0 10 16Zm9.707 4.293-4.2-4.2 1.414-1.414 4.2 4.2-1.414 1.414Z" /></svg>
                        </button>
                    </div>

                    <div className={styles['bw-search-container__bw-stage']}>
                        <span className={`${styles['bw-search-container__bw-stage__arrow']} ${selectedDim ? styles['bw-search-container__bw-stage__arrow--hidden'] : ''}`}>←</span>
                        <div className={styles['bw-search-container__bw-stage__text']}>
                            {currentDimData && !isNoMatch && (
                                <div className={styles['bw-search-container__bw-stage__title']}>{t(`HolisticSearch.dimensions.${currentDimData.label.toLowerCase()}.label`, `${currentDimData.label}`)}</div>
                            )}
                            <div className={styles['bw-search-container__bw-stage__sub']}>{stageSubtitle}</div>
                        </div>
                    </div>

                    <div className={styles['bw-search-container__bw-panel']}>
                        <div className={styles['bw-search-container__bw-tags']}>
                            {sortedEspecialidades.map((esp: any) => (
                                <button
                                    key={esp.uid}
                                    className={`${styles['bw-search-container__bw-tag']} ${suggestedTop.includes(esp.uid) && selectedDim ? styles[`bw-search-container__bw-tag--${selectedDim}`] : ''}`}
                                    onClick={() => handleTagClick(esp.uid)}
                                >
                                    {esp.name}
                                </button>
                            ))}
                        </div>

                        {selectedDim && (
                            <button className={styles['bw-search-container__bw-more']} type="button" onClick={applyFiltersSearch}>
                                {suggestedTop.length > 0
                                    ? `${t('HolisticSearch.viewProfessionalsIn', 'Ver profesionales en')} ${currentDimData?.especialidades.find((e: any) => e.uid === suggestedTop[0])?.name} →`
                                    : `${t('HolisticSearch.viewProfessionalsIn', 'Ver profesionales en')} ${t(`HolisticSearch.dimensions.${currentDimData?.label.toLowerCase()}.label`, currentDimData?.label)} →`}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};