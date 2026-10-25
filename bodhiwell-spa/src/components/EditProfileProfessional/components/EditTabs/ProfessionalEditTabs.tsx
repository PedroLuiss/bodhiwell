import React from 'react';
import ConfirmationModal from '../../../ui/ConfirmationModal/EditTabsConfirmationModal';
import CertificateViewerModal from '../../../ui/CertificateViewerModal/CertificateViewerModal';

import { ProfessionalPersonalInfoTab } from './TabsContents/ProfessionalPersonalInfoTab';
import { ProfessionalStudiesTab } from './TabsContents/ProfessionalStudiesTab';
import { ProfessionalProfileTab } from './TabsContents/ProfessionalProfileTab';

import { useProfessionalEditTabs } from './hooks/useProfessionalEditTabs';
import styles from './ProfessionalEditTabs.module.scss';
import { ProfessionalEditTabsProps } from './types/ProfessionalEditTabs.types';

const ProfessionalEditTabs: React.FC<ProfessionalEditTabsProps> = (props) => {
    const { editMode = false, studies, onStudiesChange } = props;

    const {
        t, tabValue, handleTabChange, derivedProfessions, specialties,
        loadingSpecialties, errorSpecialties, openConfirmModal,
        handleOpenConfirm, handleCloseConfirm, executeDeleteStudy,
        viewerOpen, selectedCert, handleOpenViewer, handleCloseViewer
    } = useProfessionalEditTabs({ 
        studies, 
        editMode, 
        onStudiesChange, 
        details: props.details, 
        onDetailsChange: props.onDetailsChange 
    });

    return (
        <section className={styles['edit-tabs']}>
            <nav className={styles['edit-tabs__header']}>
                <button 
                    type="button"
                    className={`${styles['edit-tabs__tab']} ${tabValue === 0 ? styles['edit-tabs__tab--active'] : ''}`}
                    onClick={() => handleTabChange(null, 0)}
                >
                    {t('appAdmin.EditTabsComponent.professionalInfo', 'Presentación')}
                </button>
                <button 
                    type="button"
                    className={`${styles['edit-tabs__tab']} ${tabValue === 1 ? styles['edit-tabs__tab--active'] : ''}`}
                    onClick={() => handleTabChange(null, 1)}
                >
                    {t('appAdmin.EditTabsComponent.studies', 'Estudios')}
                </button>
                {editMode && (
                    <button 
                        type="button"
                        className={`${styles['edit-tabs__tab']} ${tabValue === 2 ? styles['edit-tabs__tab--active'] : ''}`}
                        onClick={() => handleTabChange(null, 2)}
                    >
                        {t('appAdmin.EditTabsComponent.mainProfession', 'Profesión principal')}
                    </button>
                )}
            </nav>

            <div className={styles['edit-tabs__panel']}>
                <div className={styles['edit-tabs__content']}>
                    {tabValue === 0 && (
                        <ProfessionalPersonalInfoTab
                            editMode={editMode}
                            professionalInfo={props.professionalInfo}
                            details={props.details}
                            onDetailsChange={props.onDetailsChange}
                            errors={props.errors}
                            professionalInfoSettings={props.professionalInfoSettings}
                        />
                    )}
                    {tabValue === 1 && (
                        <ProfessionalStudiesTab
                            editMode={editMode}
                            studies={props.studies}
                            onStudiesChange={props.onStudiesChange}
                            errors={props.errors}
                            handleOpenViewer={handleOpenViewer}
                            handleOpenConfirm={handleOpenConfirm}
                            availableTags={specialties as any}
                            loadingTags={loadingSpecialties}
                            errorTags={errorSpecialties}
                        />
                    )}
                    {editMode && tabValue === 2 && (
                        <ProfessionalProfileTab
                            editMode={editMode}
                            professions={derivedProfessions}
                            details={props.details}
                            onDetailsChange={props.onDetailsChange}
                            errors={props.errors}
                            loadingSpecialties={loadingSpecialties}
                        />
                    )}
                </div>
            </div>

            <ConfirmationModal
                open={openConfirmModal}
                onClose={handleCloseConfirm}
                onConfirm={executeDeleteStudy}
                title={t('appAdmin.EditTabsComponent.confirmDeleteTitle')}
                description={t('appAdmin.EditTabsComponent.confirmDeleteDescription')}
                confirmText={t('appAdmin.EditTabsComponent.deleteConfirm')}
                confirmColor="error"
            />

            <CertificateViewerModal
                open={viewerOpen}
                onClose={handleCloseViewer}
                fileUrl={selectedCert.url}
                fileName={selectedCert.name}
                fileType={selectedCert.type}
            />
        </section>
    );
}

export default ProfessionalEditTabs;