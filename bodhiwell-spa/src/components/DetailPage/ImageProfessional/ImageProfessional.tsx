import React from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { ImageProfessionalProps } from './types';
import styles from './ImageProfessional.module.scss';
import { useImageProfessional } from './hooks/useImageProfessional';

export const ImageProfessional: React.FC<ImageProfessionalProps> = (props) => {
    const { image, isEditMode } = props;
    
    const {
        isOpen,
        isInlinePlaying,
        isVideo,
        isEmbed,
        finalVideoUrl,
        openModal,
        closeModal,
        handlePlayClick,
        stopInlinePlaying
    } = useImageProfessional(props);

    return (
        <section className={styles['media-card']}>
            <div 
                className={`${styles['media-card__hero']} ${isInlinePlaying ? styles['media-card__hero--playing'] : ''}`}
                style={{ backgroundImage: isInlinePlaying ? 'none' : `url(${image})` }}
                onClick={openModal}
                title={isVideo && !isInlinePlaying ? "Reproducir video" : "Ampliar imagen"}
            >
                {isInlinePlaying && isVideo ? (
                    <div className={styles['media-card__video-container']}>
                        {isEmbed ? (
                            <iframe
                                src={finalVideoUrl}
                                className={styles['media-card__inline-video']}
                                title="Video del Profesional"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video
                                src={finalVideoUrl}
                                className={styles['media-card__inline-video']}
                                controls
                                autoPlay
                            />
                        )}
                        <button 
                            className={styles['media-card__close-inline']}
                            onClick={stopInlinePlaying}
                            aria-label="Cerrar video"
                        >
                            <CloseIcon fontSize="small" />
                        </button>
                    </div>
                ) : (
                    !isEditMode && isVideo && (
                        <div className={styles['media-card__play']}>
                            <button 
                                className={styles['media-card__play-btn']}
                                aria-label="Reproducir"
                                onClick={handlePlayClick}
                            >
                                ▶
                            </button>
                        </div>
                    )
                )}
            </div>

            {isOpen && createPortal(
                <div className={styles['media-modal']} onClick={closeModal}>
                    <div className={styles['media-modal__content']} onClick={(e) => e.stopPropagation()}>
                        <IconButton
                            className={styles['media-modal__close']}
                            onClick={closeModal}
                            aria-label="Cerrar"
                        >
                            <CloseIcon sx={{ color: '#fff', fontSize: 32 }} />
                        </IconButton>
                        
                        <img
                            src={image}
                            alt="Visualización completa"
                            className={styles['media-modal__img']}
                        />
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};