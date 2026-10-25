import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

import { ButtonUi } from '../ButtonUi/ButtonUi';
import { ConfirmationModalProps } from '../../../types';
import styles from './ConfirmationModal.module.scss'; 

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    confirmColor = 'primary', // primary (green), error (red), warning (gold)
}) => {
    
    // Mapeo de iconos según la intención del modal
    const getIcon = () => {
        switch(confirmColor) {
            case 'error': return <ErrorOutlineRoundedIcon />;
            case 'warning': return <WarningAmberRoundedIcon />;
            default: return <HelpOutlineRoundedIcon />;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs" // Reducido para que sea más compacto y elegante
            fullWidth
            PaperProps={{
                className: styles['modal']
            }}
        >
            <div className={styles['modal__wrapper']}>
                {/* ICONO EN CAJA ESTILO BODHIWELL */}
                <div className={`${styles['modal__icon-box']} ${styles[`modal__icon-box--${confirmColor}`]}`}>
                    {getIcon()}
                </div>

                <DialogTitle className={styles['modal__title']}>
                    {title}
                </DialogTitle>

                <DialogContent className={styles['modal__content']}>
                    <p className={styles['modal__description']}>
                        {description}
                    </p>
                </DialogContent>

                <DialogActions className={styles['modal__actions']}>
                    <ButtonUi
                        variant="text"
                        onClick={onClose}
                        className={styles['modal__btn-cancel']}
                    >
                        {cancelText}
                    </ButtonUi>
                    <ButtonUi
                        variant="contained"
                        // Mapeamos el color primario de Bodhiwell o el de error del manual
                        style={{ 
                            backgroundColor: confirmColor === 'error' ? '#C95C5C' : '#82B194' 
                        }}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={styles['modal__btn-confirm']}
                    >
                        {confirmText}
                    </ButtonUi>
                </DialogActions>
            </div>
        </Dialog>
    );
};

export default ConfirmationModal;