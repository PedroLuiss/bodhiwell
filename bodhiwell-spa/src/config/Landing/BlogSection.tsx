import videoPoster from '../../assets/images/Landing/blog-kinesio-tape.jpg'; 
import blogImage from '../../assets/images/Landing/video-poster.jpg'; 


export type MediaType = 'video' | 'image';

export type IBlogPost = {
  id: number;
  mediaType: MediaType;
  mediaSrc?: string;
  posterSrc?: string; 
  title: string;
  description: string;
  linkUrl: string;
}

export const blogPosts: IBlogPost[] = [
  {
    id: 1,
    mediaType: 'video' as const,
    mediaSrc: undefined, 
    posterSrc: videoPoster,
    title: 'Videos novedades',
    description: 'Porque el cuidado también necesita flexibilidad. La red de profesionales ofrece atención...',
    linkUrl: '#'
  },
  {
    id: 2,
    mediaType: 'video' as const,
    mediaSrc: undefined, 
    posterSrc: videoPoster,
    title: 'Videos novedades',
    description: 'Porque el cuidado también necesita flexibilidad. La red de profesionales ofrece atención...',
    linkUrl: '/videos/novedades-2'
  },
  {
    id: 3,
    mediaType: 'image' as const,
    mediaSrc: blogImage,
    title: 'Blog novedades',
    description: 'Porque el cuidado también necesita flexibilidad. La red de profesionales ofrece atención...',
    linkUrl: '#'
  }
];
