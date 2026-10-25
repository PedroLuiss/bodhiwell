import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { profesionStudies } from '../../../../../types';
import { useSpecialties } from '../../../../../hooks/useSpecialties';
import { useConfirmationModal } from '../../../../../hooks/useConfirmationModal';

interface UseProfessionalEditTabsProps {
    studies?: profesionStudies[];
    editMode: boolean;
    onStudiesChange?: (updater: (arr: profesionStudies[]) => profesionStudies[]) => void;
    details?: { main_profession?: { uid: string; name: string } };
    onDetailsChange?: (key: string, value: any) => void;
}

export const useProfessionalEditTabs = ({
    studies,
    editMode,
    onStudiesChange,
    details,
    onDetailsChange
}: UseProfessionalEditTabsProps) => {
    const { t } = useTranslation();
    const { specialties, loading: loadingSpecialties, error: errorSpecialties } = useSpecialties();

    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = useCallback((_event: React.SyntheticEvent | null, newValue: number) => {
        setTabValue(newValue);
    }, []);

    useEffect(() => {
        if (!editMode && tabValue === 2) {
            setTabValue(0);
        }
    }, [editMode, tabValue]);

    const derivedProfessions = useMemo(() => {
        if (!studies || !Array.isArray(studies)) return [];

        const mainProfessionOptions = studies
            .filter(s => !s.delete && s.specialty?.uid)
            .map(s => {
                const fullSpec = specialties?.find(sp => String(sp.uid) === String(s.specialty?.uid)) || s.specialty;
                return {
                    uid: s.specialty!.uid,
                    name: s.specialty!.name,
                    fullSpec: fullSpec
                };
            })
            .filter(item => {
                if (!item.fullSpec) return false;
                const specData = item.fullSpec as any;
                const flag = specData.can_be_base_profession;
                return flag === true || flag === 1 || flag === '1' || String(flag).toLowerCase() === 'true';
            })
            .map(item => ({ uid: item.uid, name: item.name }));

        return Array.from(new Map(mainProfessionOptions.map(p => [p.uid, p])).values());
    }, [studies, specialties]);

    useEffect(() => {
        if (loadingSpecialties) return;
        const selectedUid = details?.main_profession?.uid;

        if (selectedUid && derivedProfessions) {
            const isValid = derivedProfessions.length > 0 && derivedProfessions.some(p => p.uid === selectedUid);
            if (!isValid) {
                onDetailsChange?.('main_profession', { uid: '', name: '' });
            }
        }
    }, [derivedProfessions, details?.main_profession?.uid, onDetailsChange, loadingSpecialties]);

    const {
        isOpen: openConfirmModal,
        data: confirmData,
        openModal: handleOpenConfirm,
        closeModal: handleCloseConfirm
    } = useConfirmationModal<{ index: number, type: 'study' }>();

    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedCert, setSelectedCert] = useState({ url: null as string | null, name: '', type: undefined as string | undefined });

    const handleOpenViewer = useCallback((url: string, name: string, type?: string) => {
        setSelectedCert({ url, name, type });
        setViewerOpen(true);
    }, []);

    const handleCloseViewer = useCallback(() => setViewerOpen(false), []);

    const executeDeleteStudy = useCallback(() => {
        if (confirmData && confirmData.type === 'study') {
            const index = confirmData.index;
            const studyToDelete = studies ? studies[index] : null;

            if (studyToDelete) {
                onStudiesChange?.(arr => {
                    if (studyToDelete.uid) {
                        const filtered = arr.filter((_, idx) => idx !== index);
                        return [...filtered, { ...studyToDelete, delete: true }];
                    }
                    return arr.filter((_, idx) => idx !== index);
                });
            }
        }
        handleCloseConfirm();
    }, [confirmData, studies, onStudiesChange, handleCloseConfirm]);

    return {
        t,
        tabValue,
        handleTabChange,
        derivedProfessions,
        specialties,
        loadingSpecialties,
        errorSpecialties,
        openConfirmModal,
        handleOpenConfirm,
        handleCloseConfirm,
        executeDeleteStudy,
        viewerOpen,
        selectedCert,
        handleOpenViewer,
        handleCloseViewer
    };
};