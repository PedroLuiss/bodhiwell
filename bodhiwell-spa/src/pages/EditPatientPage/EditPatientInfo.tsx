import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from "./EditPatientPage.module.scss";
import useProfile from "../../hooks/useProfile";
import { useNotification } from '../../context/NotificationContext';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { formatDate } from '../../utils/formatDate';
import PlaceholderImage from '../../assets/images/plaholderprofilewhite.png';
import { genders } from '../../types/Profile/useProfile';
import Loading from '../../components/ui/Loading/Loading';
import { TextFieldUi } from '../../components/ui/TextFieldUi/TextFieldUi';
import { SelectUi } from '../../components/ui/SelectUi/SelectUi';
import { DateInputUi } from '../../components/ui/DateInputUi/DateInputUi';
import dayjs from 'dayjs';
import { countrysData } from '../../utils/mooks';
import TruncatedHtmlContent from '../../components/ui/TruncatedHtmlContent/TruncatedHtmlContent';
import { useTranslation } from 'react-i18next';
import CustomQuillEditor from '../../components/ui/TextEditorUi/CustomQuillEditor';
import { UnsavedChangesModal } from '../../components/EditProfileProfessional/UnsavedChangesModal/UnsavedChangesModal';

const EditPatientInfo = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { profile, updatePatientProfile, getDataProfile } = useProfile();

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [profilePhoto, setProfilePhoto] = useState<string>(PlaceholderImage);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [lastSaved, setLastSaved] = useState<boolean>(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        medical_condition: '', address: '', city: '', country: '',
        date_birth: '', gender: '', profile_image: null as File | null | string,
        phone: '', zipcode: '', first_name: '', last_name: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { getDataProfile(); }, [getDataProfile]);

    const populateFormFromProfile = useCallback(() => {
        if (profile) {
            const countryValue = countrysData.find(c => c.label === profile.profile.details?.country?.name)?.value || profile.profile.details?.country?.name;
            setForm({
                medical_condition: profile.profile.details?.medical_condition || '',
                address: profile.profile.details?.address || '',
                city: profile.profile.details?.city || '',
                country: countryValue || '',
                date_birth: profile.profile.details?.date_birth ? profile.profile.details.date_birth.split('T')[0] : '',
                gender: profile.profile.details?.gender || '',
                profile_image: profile.profile.details?.image || null,
                phone: profile.profile.details?.phone || '',
                zipcode: profile.profile.details?.zipcode || '',
                first_name: profile.profile.first_name || '',
                last_name: profile.profile.last_name || '',
            });
            setProfilePhoto(profile.profile.details?.image ? `${process.env.REACT_APP_API_URL}${profile.profile.details?.image}` : PlaceholderImage);
        }
    }, [profile]);

    useEffect(() => { populateFormFromProfile(); }, [profile, populateFormFromProfile]);

    const setFieldValue = (path: string, value: any) => {
        setIsDirty(true);
        setErrors(prev => ({ ...prev, [path]: '' }));
        setForm(prev => ({ ...prev, [path]: value }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        try {
            await updatePatientProfile(form);
            showNotification(t('appAdmin.dataSaved'), 'success');
            setLastSaved(true);
            setIsDirty(false);
        } catch (err: any) {
            showNotification(t('appAdmin.EditPatientInfo.formError'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExitClick = () => {
        if (isDirty) {
            setShowUnsavedModal(true);
        } else {
            setIsEditMode(false);
            setLastSaved(false);
        }
    };

    const handleConfirmExitWithoutSaving = () => {
        setShowUnsavedModal(false);
        populateFormFromProfile();
        setIsEditMode(false);
        setIsDirty(false);
        setLastSaved(false);
    };

    const handleConfirmSaveAndExit = async () => {
        setShowUnsavedModal(false);
        setSubmitting(true);
        try {
            await updatePatientProfile(form);
            showNotification(t('appAdmin.dataSaved'), 'success');
            setLastSaved(false);
            setIsDirty(false);
            setIsEditMode(false);
        } catch (err: any) {
            showNotification(t('appAdmin.EditPatientInfo.formError'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!profile) return <Loading fullscreen text={t('appAdmin.EditPatientInfo.loadingProfile')} />;

    return (
        <div className={styles['patient-profile']}>
            <header className={styles['patient-profile__title-block']}>
                <div className={styles['patient-profile__hero-mark']}><span>✦</span></div>
                <h1 className={styles['patient-profile__main-title']}>{t('appAdmin.EditPatientInfo.titleView', 'Mi Perfil')}</h1>
                
            </header>

            <form onSubmit={handleSubmit} className={styles['patient-profile__layout']}>
                
                <div className={styles['patient-profile__content-column']}>
                   <div className={styles['patient-profile__actions']}>
                        {!isEditMode && (
                            <button className={styles['patient-profile__edit-trigger']} onClick={() => setIsEditMode(true)}>
                                {t('appAdmin.EditPatientInfo.editProfile', 'Editar Perfil')}
                            </button>
                        )}
                   </div>
                    <div className={styles['patient-profile__card-stack']}>
                        
                        <section className={styles['content-card']}>
                            <div className={styles['content-card__head']}>
                                <h2 className={styles['content-card__name']}>{form.first_name} {form.last_name}</h2>
                                <p className={styles['content-card__email']}>{profile.profile.email}</p>
                            </div>
                            <div className={styles['content-card__divider']} />

                            <div className={styles['content-card__grid-2']}>
                                <div className={styles['field']}>
                                    <label className={styles['field__label']}>{t('appAdmin.EditPatientInfo.firstName')}</label>
                                    {isEditMode ? (
                                        <TextFieldUi fullWidth value={form.first_name} onChange={e => setFieldValue('first_name', e.target.value)} />
                                    ) : <div className={styles['field__input']}>{form.first_name}</div>}
                                </div>
                                <div className={styles['field']}>
                                    <label className={styles['field__label']}>{t('appAdmin.EditPatientInfo.lastName')}</label>
                                    {isEditMode ? (
                                        <TextFieldUi fullWidth value={form.last_name} onChange={e => setFieldValue('last_name', e.target.value)} />
                                    ) : <div className={styles['field__input']}>{form.last_name}</div>}
                                </div>
                                <div className={styles['field']}>
                                    <label className={styles['field__label']}>{t('appAdmin.EditPatientInfo.birthDate')}</label>
                                    {isEditMode ? (
                                        <DateInputUi value={form.date_birth ? dayjs(form.date_birth) : null} onChange={date => setFieldValue('date_birth', date ? date.format('YYYY-MM-DD') : null)} />
                                    ) : <div className={styles['field__input']}>{form.date_birth ? formatDate(form.date_birth) : '—'}</div>}
                                </div>
                                <div className={styles['field']}>
                                    <label className={styles['field__label']}>{t('appAdmin.EditPatientInfo.gender')}</label>
                                    {isEditMode ? (
                                        <SelectUi value={form.gender || ""} onChange={e => setFieldValue('gender', e.target.value)}>
                                            {genders.map(g => <MenuItem key={g.value} value={g.value}>{t(`appAdmin.PatientProfileDetails.${g.value}`, g.label)}</MenuItem>)}
                                        </SelectUi>
                                    ) : <div className={styles['field__input']}>{form.gender ? t(`appAdmin.PatientProfileDetails.${form.gender}`) : '—'}</div>}
                                </div>
                                <div className={styles['field']}>
                                    <label className={styles['field__label']}>{t('appAdmin.EditPatientInfo.phone')}</label>
                                    {isEditMode ? (
                                        <TextFieldUi fullWidth value={form.phone} onChange={e => setFieldValue('phone', e.target.value.replace(/\D/g, ''))} />
                                    ) : <div className={styles['field__input']}>{form.phone || '—'}</div>}
                                </div>
                            </div>
                        </section>

                        <section className={styles['content-card']}>
                            <h2 className={styles['content-card__section-title']}>{t('appAdmin.EditPatientInfo.addressLabel')}</h2>
                            <div className={styles['content-card__grid-address']}>
                                <div className={styles['field']}>
                                    <label className={styles['field__label']}>{t('appAdmin.EditPatientInfo.countryLabel')}</label>
                                    {isEditMode ? (
                                        <SelectUi value={form.country || ""} onChange={e => setFieldValue('country', e.target.value)}>
                                            {countrysData.map(c => <MenuItem key={c.value} value={c.value}>{t(`countries.${c.value}`, c.label)}</MenuItem>)}
                                        </SelectUi>
                                    ) : <div className={styles['field__input']}>{form.country ? countrysData.find(c => c.value === form.country)?.label : '—'}</div>}
                                </div>
                                <div className={styles['field']}>
                                    <label className={styles['field__label']}>{t('appAdmin.EditPatientInfo.city')}</label>
                                    {isEditMode ? (
                                        <TextFieldUi fullWidth value={form.city} onChange={e => setFieldValue('city', e.target.value)} />
                                    ) : <div className={styles['field__input']}>{form.city || '—'}</div>}
                                </div>
                            </div>
                            <div className={styles['content-card__grid-1']}>
                                <div className={styles['field']}>
                                    <label className={styles['field__label']}>{t('appAdmin.EditPatientInfo.address')}</label>
                                    {isEditMode ? (
                                        <TextFieldUi fullWidth value={form.address} onChange={e => setFieldValue('address', e.target.value)} />
                                    ) : <div className={styles['field__input']}>{form.address || '—'}</div>}
                                </div>
                            </div>
                        </section>

                        <section className={styles['content-card']}>
                            <h2 className={styles['content-card__section-title']}>{t('appAdmin.EditPatientInfo.medicalConditionTitle')}</h2>
                            {isEditMode ? (
                                <div className={styles['content-card__editor-shell']}>
                                    <CustomQuillEditor
                                        onChange={(e: string) => setFieldValue('medical_condition', e)}
                                        value={form.medical_condition || ""}
                                        placeholder={t('appAdmin.EditPatientInfo.medicalConditionPlaceholder')}
                                    />
                                </div>
                            ) : (
                                <div className={styles['content-card__view-text']}>
                                    {form.medical_condition ? <TruncatedHtmlContent htmlContent={form.medical_condition} maxLength={1500} /> : <p>{t('appAdmin.EditPatientInfo.noContentAvailable')}</p>}
                                </div>
                            )}
                        </section>
                    </div>

                    {isEditMode && (
                        <div className={styles['save-bar']}>
                            <div className={styles['save-bar__pill']}>
                                <div className={styles['save-bar__state']}>
                                    <div className={`${styles['save-bar__dot']} ${lastSaved && !isDirty ? styles['save-bar__dot--saved'] : ''}`} />
                                    <div>
                                        <div className={styles['save-bar__copy']}>
                                            {lastSaved && !isDirty 
                                                ? t('appAdmin.EditPatientInfo.changesSaved', 'Cambios guardados')
                                                : t('appAdmin.EditPatientInfo.unsavedChanges', 'Cambios sin guardar')
                                            }
                                        </div>
                                        <div className={styles['save-bar__sub']}>
                                            {lastSaved && !isDirty
                                                ? t('appAdmin.EditPatientInfo.profileUpdated', 'Tu perfil está actualizado.')
                                                : t('appAdmin.EditPatientInfo.saveToUpdate', 'Guardá para actualizar tu perfil')
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className={styles['save-bar__actions']}>
                                    <button className={styles['btn-secondary']} type="button" onClick={handleExitClick}>{t('appAdmin.EditPatientInfo.cancel', 'Salir')}</button>
                                    <button className={styles['save-cta']} type="submit" disabled={submitting || (lastSaved && !isDirty)}>
                                        {submitting ? <CircularProgress size={20} color="inherit" /> : t('appAdmin.EditPatientInfo.save')}
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
                    )}
                </div>

                <aside className={styles['patient-profile__aside']}>
                    <div className={styles['side-photo']}>
                        <div className={styles['side-photo__frame']}>
                            <div className={styles['side-photo__img-container']}>
                                <img src={profilePhoto} alt="Foto de perfil" />
                            </div>
                            {isEditMode && (
                                <button type="button" className={styles['side-photo__edit-btn']} onClick={() => fileInputRef.current?.click()}>
                                    ✎
                                    <input type='file' accept='image/*' ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setFieldValue('profile_image', file);
                                            setProfilePhoto(URL.createObjectURL(file));
                                        }
                                    }} />
                                </button>
                            )}
                        </div>
                        <div className={styles['side-photo__meta']}>
                            <h3>{t('appAdmin.EditPatientInfo.photoTitle', 'Foto de perfil')}</h3>
                            <p>{t('appAdmin.EditPatientInfo.photoDesc', 'Proporción cuadrada recomendada para la imagen del consultante.')}</p>
                        </div>
                    </div>
                </aside>

            </form>
        </div>
    );
}

export default EditPatientInfo;