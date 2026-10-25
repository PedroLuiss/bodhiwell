import React from 'react';
import { Dialog } from '@mui/material';
import { useTranslation } from 'react-i18next';
import styles from './UnsavedChangesModal.module.scss';

interface UnsavedChangesModalProps {
    open: boolean;
    onClose: () => void;
    onExitWithoutSaving: () => void;
    onSaveAndExit: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
    open,
    onClose,
    onExitWithoutSaving,
    onSaveAndExit
}) => {
    const { t } = useTranslation();

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm" 
            PaperProps={{
                className: styles['unsaved-modal']
            }}
            slotProps={{
                backdrop: {
                    className: styles['unsaved-modal__backdrop']
                }
            }}
        >
            <div className={styles['unsaved-modal__container']}>
                <h4 className={styles['unsaved-modal__title']}>
                    {t('appAdmin.UnsavedChangesModal.title', 'Cambios sin guardar')}
                </h4>
                
                <p className={styles['unsaved-modal__description']}>
                    {t('appAdmin.UnsavedChangesModal.description', 'Si salís ahora, los cambios realizados en tu perfil se van a perder.')}
                </p>
                
                <div className={styles['unsaved-modal__actions']}>
                    <button 
                        type="button"
                        className={`${styles['unsaved-modal__btn']} ${styles['unsaved-modal__btn--secondary']}`}
                        onClick={onClose} 
                    >
                        {t('appAdmin.UnsavedChangesModal.continueEditing', 'Seguir editando')}
                    </button>

                    <button 
                        type="button"
                        className={`${styles['unsaved-modal__btn']} ${styles['unsaved-modal__btn--secondary']}`}
                        onClick={onExitWithoutSaving} 
                    >
                        {t('appAdmin.UnsavedChangesModal.exitWithoutSaving', 'Salir sin guardar')}
                    </button>

                    <button 
                        type="button"
                        className={`${styles['unsaved-modal__btn']} ${styles['unsaved-modal__btn--save']}`}
                        onClick={onSaveAndExit} 
                    >
                        {t('appAdmin.UnsavedChangesModal.saveAndExit', 'Guardar y salir')}
                    </button>
                </div>
            </div>
        </Dialog>
    );
};