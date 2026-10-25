import { useState, useCallback, useMemo } from 'react';
import { ImageProfessionalProps } from '../types';

export const useImageProfessional = ({ mediaType, videoUrl }: Partial<ImageProfessionalProps>) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isInlinePlaying, setIsInlinePlaying] = useState(false);

    const isVideo = useMemo(() => !!videoUrl, [videoUrl]);

    const finalVideoUrl = useMemo(() => {
        if (!videoUrl) return '';

        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const videoId = videoUrl.split('v=')[1] || videoUrl.split('/').pop();
            const cleanId = videoId?.split('&')[0];
            return `https://www.youtube.com/embed/${cleanId}?autoplay=1`;
        }

        if (videoUrl.includes('vimeo.com')) {
            const videoId = videoUrl.split('/').pop();
            return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
        }

        return videoUrl;
    }, [videoUrl]);

    const isEmbed = useMemo(() => {
        if (!videoUrl) return false;
        return videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com');
    }, [videoUrl]);

    const openModal = useCallback(() => {
        if (!isInlinePlaying) setIsOpen(true);
    }, [isInlinePlaying]);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handlePlayClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsInlinePlaying(true);
    }, []);

    const stopInlinePlaying = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsInlinePlaying(false);
    }, []);

    return {
        isOpen,
        isInlinePlaying,
        isVideo,
        isEmbed,
        finalVideoUrl,
        openModal,
        closeModal,
        handlePlayClick,
        stopInlinePlaying
    };
};