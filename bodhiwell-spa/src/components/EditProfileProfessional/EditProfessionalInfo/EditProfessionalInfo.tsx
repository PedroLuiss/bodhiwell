import { useTranslation } from 'react-i18next';

import imageDetail from '../../../assets/images/ImgDetails/Banner_placeholder.png';
import styles from './EditProfessionalInfo.module.scss';
import { ButtonUi } from '../../ui/ButtonUi/ButtonUi';

import { useEditProfessionalInfo } from '../../../hooks/useEditProfessionalInfo';
import { ProfessionalInfoProps } from '../../../types';
import { ProfessionalDataForm } from '../components/DataForm/ProfessionalDataForm/ProfessionalDataForm';
import { ProfessionalMediaSection } from '../components/MediaSection/ProfessionalMediaSection';
import { ProfessionalFormActions } from '../components/FormActions/ProfessionalFormActions';
import ProfessionalEditTabs from '../components/EditTabs/ProfessionalEditTabs';

export function ProfessionalInfoSection(props: ProfessionalInfoProps) {
    const { style, allowInternalToggle = true, editable = false, professions, loading = false } = props;
    const { t } = useTranslation();

    const {
        form,
        errors,
        submitting,
        isEditMode,
        setInternalEditing,
        setNewImageFile,
        setFieldValue,
        updateList,
        handleOtherProfessionsChange,
        handleSubmit,
        handleCancel,
        newImageFile,
        handlePhotoCropSave,
        handlePreview,
        settings,
        isDirty,
        lastSaved
    } = useEditProfessionalInfo(props);


    const imageUrl = props.user.profile.details?.banner_image
        ? `${process.env.REACT_APP_API_URL}${props.user.profile.details.banner_image}`
        : imageDetail;

    return (
        <div className={styles['professional-detail__main']} style={style}>
            {allowInternalToggle && !editable && (
                <div style={{ width: '100%', textAlign: 'right', marginBottom: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    {!isEditMode ? (
                        <>
                            
                            <ButtonUi size="small" variant="outlined" color="primary" onClick={() => setInternalEditing(true)}>{t('appAdmin.EditProfessionalInfo.editProfile')}</ButtonUi>
                        </>
                    ) : (
                        <>
                            <ButtonUi
                                size="small"
                                variant="outlined"
                                color="secondary"
                                onClick={handlePreview}
                            >
                                {t('appAdmin.EditProfessionalInfo.preview', 'Previsualizar')}
                            </ButtonUi>
                        </>
                    )}
                </div>
            )}
            <div>
                <ProfessionalMediaSection
                    isEditMode={isEditMode}
                    form={form}
                    errors={errors}
                    setFieldValue={setFieldValue}
                    setNewImageFile={setNewImageFile}
                    newImageFile={newImageFile}
                    handlePhotoCropSave={handlePhotoCropSave}
                    imageUrl={imageUrl}
                    user={props.user}
                />

                <ProfessionalDataForm
                    isEditMode={isEditMode}
                    user={props.user}
                    form={form}
                    errors={errors}
                    setFieldValue={setFieldValue}
                    professions={professions}
                    handleOtherProfessionsChange={handleOtherProfessionsChange}
                    aboutSettings={settings?.about}
                />

                <ProfessionalEditTabs
                    editMode={isEditMode}
                    professionalInfo={form.details.professional_info}
                    details={form.details}
                    onDetailsChange={(key: string, value: unknown) => setFieldValue(`details.${key}`, value)}
                    studies={form.studies ? [...form.studies] : []}
                    onStudiesChange={(updater) => updateList('studies', updater)}
                    errors={errors}
                    professionalInfoSettings={settings?.professional_info}
                />

                <ProfessionalFormActions
                    isEditMode={isEditMode}
                    submitting={submitting}
                    loading={loading}
                    onExit={handleCancel}
                    onSaveAndExit={handleSubmit}
                    onSave={() => handleSubmit(undefined, true)}
                    isDirty={isDirty}
                    lastSaved={lastSaved}
                />
            </div>
        </div>
    );
}

export default ProfessionalInfoSection;
