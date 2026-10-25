import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ProfessionalPersonalInfoTab.module.scss';
import TruncatedHtmlContent from '../../../../ui/TruncatedHtmlContent/TruncatedHtmlContent';
import CustomQuillEditor from '../../../../ui/TextEditorUi/CustomQuillEditor';
import { ProfessionalPersonalInfoTabProps } from './types/ProfessionalPersonalInfoTab.types';

export const ProfessionalPersonalInfoTab: React.FC<ProfessionalPersonalInfoTabProps> = ({
    editMode,
    professionalInfo,
    details,
    onDetailsChange,
    errors,
    professionalInfoSettings,
}) => {
    const { t } = useTranslation();
    const isContentEmpty = (text?: string) => !text || text.replace(/<[^>]*>?/gm, '').trim() === '';

    return (
        <div className={styles['info-tab']}>
            <h2 className={styles['info-tab__title']}>
                {t('appAdmin.EditTabsComponent.presentation', 'Formación y experiencia')}
            </h2>

            {editMode && (
                <div className={styles['info-tab__helper']}>
                    {t('appAdmin.EditTabsComponent.presentationHelper', 'Detallá tu formación académica, certificaciones, experiencia y áreas de especialización.')}
                </div>
            )}

            <div className={styles['info-tab__editor-box']}>
                {!editMode ? (
                    <div className={styles['info-tab__content']}>
                        <TruncatedHtmlContent
                            htmlContent={!isContentEmpty(professionalInfo) 
                                ? professionalInfo! 
                                : (professionalInfoSettings?.fallback || t('appAdmin.EditTabsComponent.noProfessionalInfo'))
                            }
                            maxLength={800}
                        />
                    </div>
                ) : (
                    <div className={styles['info-tab__editor-wrapper']}>
                        <CustomQuillEditor
                            value={isContentEmpty(details?.professional_info) ? "" : details!.professional_info}
                            onChange={(html: string) => onDetailsChange?.('professional_info', html)}
                            placeholder={professionalInfoSettings?.placeholder || professionalInfoSettings?.fallback || t('appAdmin.EditProfessionalInfo.aboutMePlaceholder')}
                        />
                    </div>
                )}
            </div>
            
            {editMode && errors?.['details.professional_info'] && (
                <span className={styles['info-tab__error']}>
                    {errors['details.professional_info']}
                </span>
            )}
        </div>
    );
};