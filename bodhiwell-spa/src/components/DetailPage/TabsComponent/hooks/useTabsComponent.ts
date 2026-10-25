import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useTabsComponent = () => {
    const { t } = useTranslation();
    
    const [tabIndex, setTabIndex] = useState(0);
    
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedCert, setSelectedCert] = useState<{ url: string; name: string; type?: string }>({ 
        url: '', 
        name: '' 
    });

    const handleTabChange = useCallback((_event: React.SyntheticEvent | null, newValue: number) => {
        setTabIndex(newValue);
    }, []);

    const handleOpenViewer = useCallback((url: string, name: string) => {
        const type = url.toLowerCase().includes('.pdf') ? 'application/pdf' : 'image/jpeg';
        setSelectedCert({ url, name, type });
        setViewerOpen(true);
    }, []);

    const handleCloseViewer = useCallback(() => {
        setViewerOpen(false);
    }, []);

    return {
        t,
        tabIndex,
        handleTabChange,
        viewerOpen,
        selectedCert,
        handleOpenViewer,
        handleCloseViewer,
    };
};