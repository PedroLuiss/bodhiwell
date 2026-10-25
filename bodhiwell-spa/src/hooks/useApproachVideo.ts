import { useState, useRef } from 'react';

export const useApproachVideo = () => {
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current && videoRef.current.duration) {
            const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(currentProgress);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current && progressBarRef.current) {
            const rect = progressBarRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const seekTime = (clickX / width) * videoRef.current.duration;
            videoRef.current.currentTime = seekTime;
        }
    };

    const handleRangeSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current && videoRef.current.duration) {
            const seekTime = (Number(e.target.value) / 100) * videoRef.current.duration;
            videoRef.current.currentTime = seekTime;
            setProgress(Number(e.target.value));
        }
    };

    return {
        isMuted,
        progress,
        videoRef,
        progressBarRef,
        toggleMute,
        handleTimeUpdate,
        handleSeek,
        handleRangeSeek
    };
};
