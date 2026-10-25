import React from 'react';
import { useTranslation } from 'react-i18next';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import styles from './MediaShowcase.module.scss';
import { useMediaShowcase } from './hooks/useMediaShowcase';

import backgroundGifStatic from '../../../assets/videos/background-sequence.mp4';
import mainVideo from '../../../assets/videos/Institucional13426.webm';

export const MediaShowcase: React.FC = () => {
    const { t } = useTranslation();
    
    const {
        videoRef,
        sectionRef,
        isPlaying,
        isMuted,
        progress,
        toggleMute,
        handleTimeUpdate,
        handleRangeSeek,
        handlePlayPause,
        handleFullscreen
    } = useMediaShowcase();

    return (
        <section ref={sectionRef} className={styles['media-showcase']} id="mediaShowcase">
            <div className={styles['media-showcase__stage']}>
                
                <div className={styles['media-showcase__bg']} aria-hidden="true">
                    <video 
                        src={backgroundGifStatic} 
                        className={styles['media-showcase__bg-image']} 
                        autoPlay 
                        muted 
                        loop={false}
                        playsInline
                    />
                </div>

                <div className={styles['media-showcase__video-shell']}>
                    <div className={styles['media-showcase__video-frame']}>
                        <button 
                            className={styles['media-showcase__fullscreen-btn']} 
                            onClick={handleFullscreen}
                            type="button"
                            aria-label={t('landing.mediaShowcase.fullscreen', 'Fullscreen')}
                        >
                            <FullscreenIcon sx={{ fontSize: 24 }} />
                        </button>

                        <video
                            ref={videoRef}
                            src={mainVideo}
                            autoPlay
                            muted={isMuted}
                            loop
                            playsInline
                            onTimeUpdate={handleTimeUpdate}
                            className={styles['media-showcase__main-video']}
                            aria-label={t('landing.mediaShowcase.ariaLabel', 'Video institucional')}
                        />

                        <div className={styles['media-showcase__controls']}>
                            <button 
                                className={styles['media-showcase__control-btn']} 
                                onClick={handlePlayPause}
                                type="button"
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? '❚❚' : '▶'}
                            </button>

                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={progress} 
                                step="0.1"
                                className={styles['media-showcase__progress']}
                                onChange={handleRangeSeek}
                                aria-label="Video progress"
                            />

                            <button 
                                className={styles['media-showcase__control-btn']} 
                                onClick={toggleMute}
                                type="button"
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? '🔇' : '🔊'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};