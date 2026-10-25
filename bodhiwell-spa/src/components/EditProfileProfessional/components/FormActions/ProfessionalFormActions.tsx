import React from 'react';
import { useTranslation } from 'react-i18next';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './ProfessionalFormActions.module.scss';
import { UnsavedChangesModal } from '../../UnsavedChangesModal/UnsavedChangesModal';
import { localStorageHelper } from '../../../../utils/localStorageHelper';
import { PROFESSIONAL_PROFILE_AUTOSAVE_KEY } from '../../../../constants';

interface ProfessionalFormActionsProps {
    isEditMode: boolean;
    submitting: boolean;
    onExit?: () => void;
    onSaveAndExit?: () => void;
    onSave?: () => void;
    isDirty?: boolean;
    lastSaved?: boolean;
    loading?: boolean;
}

export const ProfessionalFormActions: React.FC<ProfessionalFormActionsProps> = ({
    isEditMode,
    submitting,
    loading,
    onExit,
    onSaveAndExit,
    onSave,
    isDirty,
    lastSaved
}) => {
    const { t } = useTranslation();
    const [showUnsavedModal, setShowUnsavedModal] = React.useState(false);

    if (!isEditMode) return null;

    const handleExitClick = () => {
        setShowUnsavedModal(true);
    };

    const handleConfirmExitWithoutSaving = () => {
        localStorageHelper.removeItem(PROFESSIONAL_PROFILE_AUTOSAVE_KEY);
        setShowUnsavedModal(false);
        if (onExit) onExit();
    };

    const handleConfirmSaveAndExit = () => {
        setShowUnsavedModal(false);
        if (onSaveAndExit) onSaveAndExit();
    };

    const handleSaveClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onSave) onSave();
    };

    return (
        <div className={styles['save-bar']}>
            <div className={styles['save-bar__pill']}>
                
                <div className={styles['save-bar__state']}>
                    <div className={`${styles['save-bar__dot']} ${lastSaved && !isDirty ? styles['save-bar__dot--saved'] : ''}`} />
                    <div className={styles['save-bar__info']}>
                        <div className={styles['save-bar__title']}>
                            {lastSaved && !isDirty 
                                ? t('appAdmin.EditProfessionalInfo.changesSaved', 'Cambios guardados')
                                : t('appAdmin.EditProfessionalInfo.savePrompt', 'Tenés cambios sin guardar')
                            }
                        </div>
                        <div className={styles['save-bar__subtitle']}>
                            {lastSaved && !isDirty
                                ? t('appAdmin.EditProfessionalInfo.profileUpdated', 'Tu perfil está actualizado.')
                                : t('appAdmin.EditProfessionalInfo.saveSubtitle', 'Guardalos para actualizar la información visible en tu perfil.')
                            }
                        </div>
                    </div>
                </div>

                <div className={styles['save-bar__actions']}>
                    <button 
                        type="button" 
                        className={styles['save-bar__btn-exit']}
                        onClick={handleExitClick}
                    >
                        {t('appAdmin.EditProfessionalInfo.exit', 'Salir')}
                    </button>
                    
                    <button 
                        type="button" 
                        className={styles['save-bar__btn-save']}
                        disabled={submitting || loading || (lastSaved && !isDirty)}
                        onClick={handleSaveClick}
                    >
                        {submitting || loading ? (
                            <CircularProgress size={18} color="inherit" />
                        ) : (
                            t('appAdmin.EditProfessionalInfo.save', 'Guardar')
                        )}
                    </button>
                </div>

            </div>

            <UnsavedChangesModal
                open={showUnsavedModal}
                onClose={() => setShowUnsavedModal(false)}
                onExitWithoutSaving={handleConfirmExitWithoutSaving}
                onSaveAndExit={handleConfirmSaveAndExit}
            />
        </div>
    );
};