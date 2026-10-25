import { useState, useEffect, useRef } from 'react';

interface UseGifVisibilityOptions {
    threshold?: number;
    rootMargin?: string;
}

export const useGifVisibility = (
    gifSource: string,
    options: UseGifVisibilityOptions = {}
) => {
    const { threshold = 0.1, rootMargin = '90px' } = options;

    const [gifSrc, setGifSrc] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentElement = elementRef.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setGifSrc(`${gifSource}?t=${Date.now()}`);
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            },
            {
                root: null,
                rootMargin,
                threshold,
            }
        );

        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [gifSource, threshold, rootMargin]);

    return { gifSrc, isVisible, elementRef };
};
