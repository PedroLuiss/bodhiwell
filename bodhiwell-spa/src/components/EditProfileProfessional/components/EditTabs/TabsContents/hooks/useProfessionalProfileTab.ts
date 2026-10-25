import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { professionsItems } from '../../../../../../types';

interface UseProfessionalProfileTabProps {
    professions?: professionsItems[];
    details?: { main_profession?: { uid: string; name: string } };
    onDetailsChange?: (key: string, value: any) => void;
    loadingSpecialties?: boolean;
}

export const useProfessionalProfileTab = ({
    professions,
    details,
    onDetailsChange,
    loadingSpecialties
}: UseProfessionalProfileTabProps) => {
    const { t } = useTranslation();
    const [selectedUid, setSelectedUid] = useState(details?.main_profession?.uid || '');

    useEffect(() => {
        if (typeof details?.main_profession?.uid !== 'undefined') {
            setSelectedUid(details.main_profession.uid);
        }
    }, [details?.main_profession?.uid]);

    useEffect(() => {
        if (loadingSpecialties) return;

        if (selectedUid && professions && professions.length > 0) {
            const isValid = professions.some(p => p.uid === selectedUid);
            if (!isValid) {
                setSelectedUid('');
                onDetailsChange?.('main_profession', { uid: '', name: '' });
            }
        }
    }, [professions, selectedUid, onDetailsChange, loadingSpecialties]);

    const handleProfessionChange = useCallback((event: any) => {
        const newUid = event.target.value;
        setSelectedUid(newUid);

        const profession = professions?.find(p => p.uid === newUid);
        if (profession) {
            onDetailsChange?.('main_profession', {
                uid: profession.uid,
                name: profession.name
            });
        }
    }, [professions, onDetailsChange]);

    const getSelectedProfessionName = useCallback((uid: string) => {
        return professions?.find(p => p.uid === uid)?.name;
    }, [professions]);

    return {
        t,
        selectedUid,
        handleProfessionChange,
        getSelectedProfessionName
    };
};