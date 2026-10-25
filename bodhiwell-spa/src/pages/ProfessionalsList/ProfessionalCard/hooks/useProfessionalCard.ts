import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Professional } from '../types/Professional.types';

export const useProfessionalCard = (professional: Professional, uid: string) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  const getEmbedUrl = useCallback((url?: string) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1] || url.split('/').pop();
      const cleanId = videoId?.split('&')[0];
      return `https://www.youtube.com/embed/${cleanId}?autoplay=1`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  }, []);

  const videoData = useMemo(() => {
    const isVideo = professional.mediaType === 'video' && !!professional.videoUrl;
    const isEmbed = !!professional.videoUrl && (
      professional.videoUrl.includes('youtube.com') || 
      professional.videoUrl.includes('youtu.be') || 
      professional.videoUrl.includes('vimeo.com')
    );
    
    return {
      isVideo,
      isEmbed,
      finalVideoUrl: isEmbed ? getEmbedUrl(professional.videoUrl) : professional.videoUrl
    };
  }, [professional, getEmbedUrl]);

  const handleCardClick = useCallback(() => {
    navigate(`/professionals/${uid}`);
  }, [navigate, uid]);

  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
  }, []);

  const handleSocialClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const dimColor = useMemo(() => {
    const dimensionColors: Record<string, string> = {
      cuerpo: '#304E8F',
      mente: '#5C9DD6',
      conciencia: '#695EA6',
      energia: '#4FB08C'
    };
    return dimensionColors[professional.dimension?.toLowerCase() || 'cuerpo'] || '#82B194';
  }, [professional.dimension]);

  return {
    isPlaying,
    videoData,
    dimColor,
    handleCardClick,
    handlePlayClick,
    handleSocialClick
  };
};