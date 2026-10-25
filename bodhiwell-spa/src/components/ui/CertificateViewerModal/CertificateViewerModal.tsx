import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import styles from './CertificateViewerModal.module.scss';
import { CertificateViewerModalProps } from '../../../types';

import { createPortal } from 'react-dom';

const CertificateViewerModal: React.FC<CertificateViewerModalProps> = ({ open, onClose, fileUrl, fileName, fileType }) => {
    const { t } = useTranslation();

    useEffect(() => {
        if (open && fileUrl) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open, fileUrl]);

    if (!open || !fileUrl) return null;

    const isPdfFormat = (fileType === 'application/pdf') || fileUrl.toLowerCase().includes('.pdf') || (fileUrl.startsWith('blob:') && fileName?.toLowerCase().endsWith('.pdf'));

    return createPortal(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <IconButton
                    onClick={onClose}
                    className={styles.closeButton}
                    title={t('common.close', 'Cerrar')}
                >
                    <CloseIcon />
                </IconButton>
                <div className={styles.modalBody}>
                    {isPdfFormat ? (
                        <iframe
                            src={fileUrl}
                            className={styles.pdfViewer}
                            title="PDF Preview"
                        />
                    ) : (
                        <img src={fileUrl} alt="Certificate" className={styles.imageViewer} />
                    )}
                </div>
                {fileName && <div className={styles.modalCaption}>{fileName}</div>}
            </div>
        </div>,
        document.body
    );
};

export default CertificateViewerModal;
