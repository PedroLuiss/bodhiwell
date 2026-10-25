import { useState, useEffect, useRef, useCallback } from 'react';
import { useApproachVideo } from '../../../../hooks/useApproachVideo';

export const useMediaShowcase = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const sectionRef = useRef<HTMLElement>(null);

    const videoState = useApproachVideo();
    const { videoRef } = videoState;

    const handlePlayPause = useCallback(() => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    }, [videoRef]);

    const handleFullscreen = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if ((video as any).webkitRequestFullscreen) {
            (video as any).webkitRequestFullscreen();
        } else if ((video as any).mozRequestFullScreen) {
            (video as any).mozRequestFullScreen();
        } else if ((video as any).msRequestFullscreen) {
            (video as any).msRequestFullscreen();
        }

        if (window.screen.orientation && (window.screen.orientation as any).lock) {
            (window.screen.orientation as any).lock('landscape').catch(() => {
                console.log('Orientation lock not supported or failed');
            });
        }
    }, [videoRef]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (videoRef.current) {
                    if (entry.isIntersecting) {
                        videoRef.current.play().catch((error) => {
                            console.warn("Autoplay was prevented:", error);
                        });
                        setIsPlaying(true);
                    } else {
                        videoRef.current.pause();
                        setIsPlaying(false);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, options);
        const currentSection = sectionRef.current;

        if (currentSection) {
            observer.observe(currentSection);
        }

        return () => {
            if (currentSection) {
                observer.unobserve(currentSection);
            }
        };
    }, [videoRef]);

    return {
        ...videoState,
        isPlaying,
        sectionRef,
        handlePlayPause,
        handleFullscreen
    };
};