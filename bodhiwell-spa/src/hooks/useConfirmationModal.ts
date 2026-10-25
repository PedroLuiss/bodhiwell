import { useState, useCallback } from 'react';

export const useConfirmationModal = <T = any>() => {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<T | null>(null);

    const openModal = useCallback((modalData: T) => {
        setData(modalData);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setData(null);
    }, []);

    return {
        isOpen,
        data,
        openModal,
        closeModal
    };
};

export default useConfirmationModal;
