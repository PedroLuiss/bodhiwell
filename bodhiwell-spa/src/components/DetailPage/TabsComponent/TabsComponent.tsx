import React from 'react';
import styles from './TabsComponent.module.scss';
import CertificateViewerModal from '../../ui/CertificateViewerModal/CertificateViewerModal';
import TruncatedHtmlContent from '../../ui/TruncatedHtmlContent/TruncatedHtmlContent';
import mortarBoard from "../../../assets/images/ImgDetails/mortarBoard.png";
import { useTabsComponent } from './hooks/useTabsComponent';
import { StudyCard } from '../StudyCard/StudyCard';
import { TabsComponentProps } from './types';

const TabsComponent: React.FC<TabsComponentProps> = ({
    professionalInfo,
    studies,
    educationDefaultText,
}) => {
    const {
        t,
        tabIndex,
        handleTabChange,
        viewerOpen,
        selectedCert,
        handleOpenViewer,
        handleCloseViewer
    } = useTabsComponent();

    const isInfoTab = tabIndex === 0;

    return (
        <div className={styles['tab-system']}>
            <div className={styles['tab-system__header']}>
                <button 
                    className={`${styles['tab-system__button']} ${isInfoTab ? styles['tab-system__button--active'] : ''}`}
                    onClick={(e) => handleTabChange(e, 0)}
                >
                    {t('landing.TabsComponent.professionalInfo', 'Presentación')}
                </button>
                <button 
                    className={`${styles['tab-system__button']} ${tabIndex === 1 ? styles['tab-system__button--active'] : ''}`}
                    onClick={(e) => handleTabChange(e, 1)}
                >
                    {t('landing.TabsComponent.studies', 'Estudios')}
                </button>
            </div>

            <div className={styles['tab-system__panel']}>
                <div className={styles['tab-system__icon-box']}>
                    <img src={mortarBoard} alt="Icono de educación" />
                </div>
                
                <div className={styles['tab-system__content']}>
                    {isInfoTab ? (
                        <>
                            <h3 className={styles['tab-system__title']}>
                                {t('landing.TabsComponent.trainingAndExperience', 'Formación y experiencia')}
                            </h3>
                            <div className={styles['tab-system__text']}>
                                <TruncatedHtmlContent
                                    htmlContent={professionalInfo?.replace(/<[^>]*>?/gm, '').trim()
                                        ? professionalInfo
                                        : (educationDefaultText || t('appAdmin.EditTabsComponent.professionalInfoPlaceholder'))}
                                    maxLength={1000}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className={styles['tab-system__title']}>
                                {t('landing.TabsComponent.studiesTitle', 'Estudios y certificaciones')}
                            </h3>
                            <div className={styles['tab-system__studies-list']}>
                                {studies && studies.length > 0 ? (
                                    studies.map((study, index) =>
                                        study.is_validated && (
                                            <StudyCard
                                                key={study.uid || index}
                                                study={study}
                                                onViewCertificate={handleOpenViewer}
                                            />
                                        )
                                    )
                                ) : (
                                    <div className={styles['tab-system__empty']}>
                                        {t('landing.TabsComponent.noStudies', 'No se han agregado estudios')}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <CertificateViewerModal
                open={viewerOpen}
                onClose={handleCloseViewer}
                fileUrl={selectedCert.url}
                fileName={selectedCert.name}
                fileType={selectedCert.type}
            />
        </div>
    );
};

export default TabsComponent;