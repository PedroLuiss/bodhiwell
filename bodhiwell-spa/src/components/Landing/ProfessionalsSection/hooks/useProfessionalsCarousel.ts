import { useRef, useState, useEffect, useCallback } from 'react';

export const useProfessionalsCarousel = (itemsCount: number) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [activePage, setActivePage] = useState(0);
    const [pageCount, setPageCount] = useState(1);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(true);

    const updateState = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;

        const { scrollLeft, scrollWidth, clientWidth } = track;
        const maxScroll = scrollWidth - clientWidth;

        setPageCount(Math.max(1, Math.ceil(scrollWidth / clientWidth)));
        setActivePage(maxScroll === 0 ? 0 : Math.round(scrollLeft / clientWidth));
        setCanPrev(scrollLeft > 8);
        setCanNext(scrollLeft < maxScroll - 8);
    }, []);

    useEffect(() => {
        updateState();
        window.addEventListener('resize', updateState);
        return () => window.removeEventListener('resize', updateState);
    }, [updateState, itemsCount]);

    const scroll = (direction: 'next' | 'prev') => {
        const track = trackRef.current;
        if (!track) return;
        const width = track.clientWidth;
        track.scrollBy({ left: direction === 'next' ? width : -width, behavior: 'smooth' });
    };

    const goToPage = (pageIndex: number) => {
        const track = trackRef.current;
        if (!track) return;
        track.scrollTo({ left: pageIndex * track.clientWidth, behavior: 'smooth' });
    };

    return { trackRef, activePage, pageCount, canPrev, canNext, scroll, goToPage, updateState };
};