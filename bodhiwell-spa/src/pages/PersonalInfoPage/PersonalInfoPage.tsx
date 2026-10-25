import dayjs from 'dayjs';
import { MenuItem, CircularProgress } from '@mui/material';
import { TextFieldUi } from '../../components/ui/TextFieldUi/TextFieldUi';
import { SelectUi } from '../../components/ui/SelectUi/SelectUi';
import { genders } from '../../types/Profile/useProfile';
import { countrysData } from '../../utils/mooks';
import Loading from '../../components/ui/Loading/Loading';
import { UserStatusToast } from '../../components/ui/UserStatusToast/UserStatusToast';
import { DateInputUi } from '../../components/ui/DateInputUi/DateInputUi';
import styles from './PersonalInfoPage.module.scss';
import { usePersonalInfoPage } from './hooks/usePersonalInfoPage';
import ProfessionalPhotoCropper from '../../components/ProfessionalPhotoEditor/ProfessionalPhotoCropper';
import { UnsavedChangesModal } from '../../components/EditProfileProfessional/UnsavedChangesModal/UnsavedChangesModal';

const PersonalInfoPage = () => {
    const {
        form, setForm, errors, loading, fetching,
        imageUrl, handleChange, handlePhotoCropSave, handleSubmit,  t,
        isCropperOpen, setIsCropperOpen,
        isEditMode, setIsEditMode, isDirty, lastSaved,
        showUnsavedModal, setShowUnsavedModal, handleExitClick, handleConfirmExitWithoutSaving, handleConfirmSaveAndExit
    } = usePersonalInfoPage();

    if (fetching) {
        return <Loading fullscreen text={t('appAdmin.EditPersonalInfo.loadingProfile')} />;
    }

    return (
        <>
            <div className={styles['personal-info']}>
                <UserStatusToast />

                <form onSubmit={handleSubmit} noValidate className={styles['personal-info__layout']}>
                    
                    <div className={styles['personal-info__content']}>
                        <div className={styles['personal-info__actions']}>
                            {!isEditMode && (
                                <button className={styles['personal-info__edit-trigger']} type="button" onClick={() => setIsEditMode(true)}>
                                    {t('appAdmin.EditPersonalInfo.editProfile', 'Editar Perfil')}
                                </button>
                            )}
                        </div>
                        <section className={styles['content-card']}>
                            <div className={styles['content-card__title-block']}>
                                <h2>{t('appAdmin.EditPersonalInfo.title', 'Mi Perfil')}</h2>
                            </div>

                            <div className={styles['section-block']}>
                                <h3 className={styles['section-block__heading']}>
                                    {t('appAdmin.EditPersonalInfo.personalData', 'Datos personales')}
                                </h3>
                                
                                <div className={styles['grid-2']}>
                                    <div className={styles['field']}>
                                        <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.firstName')}</label>
                                        {isEditMode ? <TextFieldUi value={form.first_name} onChange={handleChange('first_name')} error={!!errors.first_name} fullWidth /> : <div className={styles['field__input']}>{form.first_name || '—'}</div>}
                                    </div>
                                    <div className={styles['field']}>
                                        <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.lastName')}</label>
                                        {isEditMode ? <TextFieldUi value={form.last_name} onChange={handleChange('last_name')} error={!!errors.last_name} fullWidth /> : <div className={styles['field__input']}>{form.last_name || '—'}</div>}
                                    </div>
                                    <div className={styles['field']}>
                                        <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.dateBirth')}</label>
                                        {isEditMode ? <DateInputUi value={form.details.date_birth ? dayjs(form.details.date_birth) : null} onChange={(date) => setForm(prev => ({ ...prev, details: { ...prev.details, date_birth: date ? date.format('YYYY-MM-DD') : '' }}))} /> : <div className={styles['field__input']}>{form.details.date_birth || '—'}</div>}
                                    </div>
                                    <div className={styles['field']}>
                                        <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.dni')}</label>
                                        {isEditMode ? <TextFieldUi value={form.dni} onChange={handleChange('dni')} error={!!errors.dni} fullWidth /> : <div className={styles['field__input']}>{form.dni || '—'}</div>}
                                    </div>
                                    <div className={styles['field']}>
                                        <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.gender')}</label>
                                        {isEditMode ? <SelectUi value={form.details.gender} onChange={(e) => setForm(prev => ({ ...prev, details: { ...prev.details, gender: e.target.value as string }}))}>{genders.map(g => <MenuItem key={g.value} value={g.value}>{t(`appAdmin.EditPersonalInfo.${g.value}`, g.label)}</MenuItem>)}</SelectUi> : <div className={styles['field__input']}>{form.details.gender ? t(`appAdmin.EditPersonalInfo.${form.details.gender}`) : '—'}</div>}
                                    </div>
                                    <div className={styles['field']}>
                                        <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.phoneNumber')}</label>
                                        {isEditMode ? <TextFieldUi value={form.details.phone} onChange={handleChange('details.phone')} fullWidth /> : <div className={styles['field__input']}>{form.details.phone || '—'}</div>}
                                    </div>
                                    <div className={styles['field']}>
                                        <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.country')}</label>
                                        {isEditMode ? <SelectUi value={form.details.country} onChange={(e) => setForm(prev => ({ ...prev, details: { ...prev.details, country: e.target.value as string }}))}>{countrysData.map(c => <MenuItem key={c.value} value={c.value}>{t(`countries.${c.value}`, c.label)}</MenuItem>)}</SelectUi> : <div className={styles['field__input']}>{form.details.country ? countrysData.find(c => c.value === form.details.country)?.label || form.details.country : '—'}</div>}
                                    </div>
                                    <div className={styles['field']}>
                                        <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.city')}</label>
                                        {isEditMode ? <TextFieldUi value={form.details.city} onChange={handleChange('details.city')} fullWidth /> : <div className={styles['field__input']}>{form.details.city || '—'}</div>}
                                    </div>
                                </div>

                                <div className={styles['grid-address']}>
                                    <div className={styles['field']}>
                                        <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.address')}</label>
                                        {isEditMode ? <TextFieldUi value={form.details.address} onChange={handleChange('details.address')} fullWidth /> : <div className={styles['field__input']}>{form.details.address || '—'}</div>}
                                    </div>
                                    <div className={styles['field']}>
                                        <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.zipcode')}</label>
                                        {isEditMode ? <TextFieldUi type="number" value={form.details.zipcode} onChange={handleChange('details.zipcode')} fullWidth /> : <div className={styles['field__input']}>{form.details.zipcode || '—'}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className={styles['section-block']}>
                                <h3 className={styles['section-block__heading']}>
                                    {t('appAdmin.EditPersonalInfo.paymentInfo', 'Información de cobro')}
                                </h3>
                                <div className={styles['grid-2']}>
                                    <div className={styles['field']}>
                                        <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.bankName')}</label>
                                        {isEditMode ? <TextFieldUi value={form.details.bank_name} onChange={handleChange('details.bank_name')} fullWidth /> : <div className={styles['field__input']}>{form.details.bank_name || '—'}</div>}
                                    </div>
                                    <div className={styles['field']}>
                                        <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.numberAccount')}</label>
                                        {isEditMode ? <TextFieldUi value={form.details.account_number} onChange={handleChange('details.account_number')} fullWidth /> : <div className={styles['field__input']}>{form.details.account_number || '—'}</div>}
                                    </div>
                                </div>
                                <div className={styles['field']} style={{ marginTop: '24px' }}>
                                    <label className={styles['field__label']}>{t('appAdmin.EditPersonalInfo.holderName')}</label>
                                    {isEditMode ? <TextFieldUi value={form.details.holder_name} onChange={handleChange('details.holder_name')} fullWidth /> : <div className={styles['field__input']}>{form.details.holder_name || '—'}</div>}
                                </div>
                            </div>

                            {isEditMode && (
                                <div className={styles['save-bar']}>
                                    <div className={styles['save-bar__pill']}>
                                        <div className={styles['save-bar__state']}>
                                            <div className={`${styles['save-bar__dot']} ${lastSaved && !isDirty ? styles['save-bar__dot--saved'] : ''}`} />
                                            <div className={styles['save-bar__info']}>
                                                <div className={styles['save-bar__copy']}>
                                                    {lastSaved && !isDirty 
                                                        ? t('appAdmin.EditPersonalInfo.changesSaved', 'Cambios guardados')
                                                        : t('appAdmin.EditPersonalInfo.unsavedChanges', 'Tenés cambios sin guardar')
                                                    }
                                                </div>
                                                <div className={styles['save-bar__sub']}>
                                                    {lastSaved && !isDirty 
                                                        ? t('appAdmin.EditPersonalInfo.profileUpdated', 'Tu perfil está actualizado.')
                                                        : t('appAdmin.EditPersonalInfo.saveToUpdate', 'Guardalos para actualizar la información visible en tu perfil')
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles['save-bar__actions']}>
                                            <button className={styles['btn-secondary']} type="button" onClick={handleExitClick}>{t('appAdmin.EditPersonalInfo.salir', 'Salir')}</button>
                                            <button className={styles['save-cta']} type="submit" disabled={loading}>
                                                {loading ? <CircularProgress size={20} color="inherit" /> : t('appAdmin.EditPersonalInfo.Keep')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className={styles['personal-info__aside']}>
                        <div className={styles['side-photo']}>
                            <div className={styles['side-photo__frame']}>
                                <div className={styles['side-photo__img-container']} style={{ backgroundImage: `url(${imageUrl})` }}>
                                </div>
                                {isEditMode && (
                                    <button type="button" className={styles['side-photo__edit-btn']} onClick={() => setIsCropperOpen(true)}>
                                        ✎
                                    </button>
                                )}
                            </div>
                            <div className={styles['side-photo__meta']}>
                                <h3>{t('appAdmin.EditPersonalInfo.profilePhoto', 'Foto de perfil')}</h3>
                                <p>{t('appAdmin.EditPersonalInfo.photoNote', '320 × 400 px recomendados. Mantiene la misma proporción y escala que usamos en las tarjetas.')}</p>
                            </div>
                        </div>
                    </aside>

                </form>
            </div>

            <ProfessionalPhotoCropper
                open={isCropperOpen}
                onClose={() => setIsCropperOpen(false)}
                onSave={handlePhotoCropSave}
            />
            
            <UnsavedChangesModal 
                open={showUnsavedModal}
                onClose={() => setShowUnsavedModal(false)}
                onExitWithoutSaving={handleConfirmExitWithoutSaving}
                onSaveAndExit={handleConfirmSaveAndExit}
            />
        </>
    );
}

export default PersonalInfoPage;