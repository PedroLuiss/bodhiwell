import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ProfessionalDataForm.module.scss';
import { ProfessionalViewMode } from '../../ViewMode/ProfessionalViewMode';
import { ProfessionalEditForm } from '../ProfessionalEditForm/ProfessionalEditForm';
import CustomQuillEditor from '../../../../ui/TextEditorUi/CustomQuillEditor';
import TruncatedHtmlContent from '../../../../ui/TruncatedHtmlContent/TruncatedHtmlContent';
import { ProfessionalDataFormProps } from './types';

export const ProfessionalDataForm: React.FC<ProfessionalDataFormProps> = ({
    isEditMode,
    user,
    form,
    errors,
    setFieldValue,
    professions,
    handleOtherProfessionsChange,
    aboutSettings
}) => {
    const { t } = useTranslation();

    const aboutRaw = user.profile.details?.about || '';
    const aboutCleaned = aboutRaw.replace(/<[^>]*>/g, "").trim();
    const aboutText = aboutCleaned ? aboutRaw : (aboutSettings?.fallback || t('appAdmin.EditProfessionalInfo.aboutText'));

    return (
        <div className={styles['data-form']}>
                {isEditMode ? (
                    <ProfessionalEditForm
                        form={form}
                        errors={errors}
                        setFieldValue={setFieldValue}
                        professions={professions}
                        handleOtherProfessionsChange={handleOtherProfessionsChange}
                    />
                ) : (
                    <section className={styles['data-form__section']}>
                        <ProfessionalViewMode
                            user={user}
                            form={form}
                        />
                    </section>
                )}

                <section className={styles['data-form__section']}>
                    <h2 className={styles['data-form__title']}>
                        {t('appAdmin.EditProfessionalInfo.aboutMe', 'Mi propósito y enfoque')}
                    </h2>

                    <div className={styles['data-form__editor-box']}>
                    {isEditMode ? (
                        <div className={styles['data-form__editor-container']}>
                            <CustomQuillEditor
                                value={(!form.details.about || aboutCleaned === "") ? "" : form.details.about}
                                onChange={(html) => setFieldValue('details.about', html)}
                                placeholder={aboutSettings?.placeholder || aboutSettings?.fallback || t('appAdmin.EditProfessionalInfo.aboutMePlaceholder')}
                            />
                            {errors.about && <small className={styles['data-form__error']}>{errors.about}</small>}
                        </div>
                    ) : (
                        <div className={styles['data-form__content']}>
                            <TruncatedHtmlContent
                                htmlContent={aboutText}
                                maxLength={700}
                            />
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};