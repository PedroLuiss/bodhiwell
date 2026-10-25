import React from 'react';
import styles from './VideoModal.module.scss';
import ReactDOM from 'react-dom';
import { VideoModalProps } from '../../Landing/MediaShowcase/types';

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoSrc }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className={`${styles['video-modal']} ${isOpen ? styles['video-modal--open'] : ''}`} onClick={onClose}>
            <div className={styles['video-modal__content']} onClick={(e) => e.stopPropagation()}>
                <button className={styles['video-modal__close']} onClick={onClose}>&times;</button>
                <video
                    className={styles['video-modal__video']}
                    src={videoSrc}
                    controls
                    autoPlay
                />
            </div>
        </div>,
        document.body
    );
};
