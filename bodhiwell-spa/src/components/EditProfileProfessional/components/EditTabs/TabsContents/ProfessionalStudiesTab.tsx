import React from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, CircularProgress, IconButton, Tooltip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import dayjs from 'dayjs';


import { TextFieldUi } from '../../../../ui/TextFieldUi/TextFieldUi';
import { SelectUi } from '../../../../ui/SelectUi/SelectUi';
import { DateInputUi } from '../../../../ui/DateInputUi/DateInputUi';
import { MultiSelectUi } from '../../../../ui/MultiSelectUi/MultiSelectUi';
import { ButtonUi } from '../../../../ui/ButtonUi/ButtonUi';
import { StudyCard } from '../../../../DetailPage/StudyCard/StudyCard';

import { studiesTypes } from '../../../../../types/Studies/studiesSelects';
import styles from './ProfessionalStudiesTab.module.scss';
import { ProfessionalStudiesTabProps } from './types/ProfessionalStudiesTab.types';

export const ProfessionalStudiesTab: React.FC<ProfessionalStudiesTabProps> = ({
    editMode,
    studies,
    onStudiesChange,
    errors,
    handleOpenViewer,
    handleOpenConfirm,
    availableTags = [],
    loadingTags = false,
    errorTags = null,
}) => {
    const { t } = useTranslation();

    const requiredSpecialties = studies
        ?.filter(s => !s.delete && s.specialty?.requires_msp)
        .map(s => s.specialty!.name);


    return (
        <div className={styles['studies-tab']}>
            
            {editMode && requiredSpecialties && requiredSpecialties.length > 0 && (
                <div className={styles['msp-notice']}>
                    <div className={styles['msp-notice__card']}>
                        <WarningAmberIcon className={styles['msp-notice__icon']} />
                        <div className={styles['msp-notice__text']}>
                            <strong>{t('appAdmin.EditTabsComponent.importantTitle', 'Validación de Especialidad')}</strong>
                            <p>
                                {t('appAdmin.EditTabsComponent.mspValidationInfo', 'Para validar tu especialidad, utilizaremos tus datos personales. Por favor, asegúrate de haber completado tu Nombre, Apellido y Documento de Identidad en la pestaña \'Datos Personales\'.')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {!editMode ? (
                <div className={styles['studies-tab__list']}>
                    {studies && studies.length > 0 ? (
                        studies.map((study, index) => (
                            !study.delete && (
                                <StudyCard key={index} study={study} onViewCertificate={handleOpenViewer} />
                            )
                        ))
                    ) : (
                        <p className={styles['studies-tab__empty']}>{t('appAdmin.EditTabsComponent.noStudies')}</p>
                    )}
                </div>
            ) : (
                <div className={styles['studies-editor']}>
                    <div className={styles['studies-editor__header']}>
                        <ButtonUi 
                            variant="outlined" 
                            onClick={() => onStudiesChange?.(arr => [
                                { name: '', institute: '', type: { code: '', label: '' }, type_other: '', specialty: null, date_start: '', date_end: '', url_certificate: null },
                                ...arr
                            ])}
                            startIcon={<AddRoundedIcon />}
                        >
                            {t('appAdmin.EditTabsComponent.addStudy')}
                        </ButtonUi>
                    </div>

                    {errors?.['studies'] && <div className={styles['studies-editor__error-msg']}>{errors['studies']}</div>}

                    <div className={styles['studies-editor__grid']}>
                        {studies?.map((s, i) => (
                            !s.delete && (
                                <article key={i} className={styles['edit-card']}>
                                    <button 
                                        className={styles['edit-card__delete']}
                                        onClick={() => handleOpenConfirm({ index: i, type: 'study' })}
                                        type="button"
                                    >
                                        <DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />
                                    </button>

                                    <div className={styles['edit-card__form-grid']}>
                                        <TextFieldUi
                                            label={t('appAdmin.EditTabsComponent.titleStudy')}
                                            placeholder={t('appAdmin.EditTabsComponent.titleStudyPlaceholder')}
                                            value={s.name || ''}
                                            onChange={e => onStudiesChange?.(arr => arr.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                                        />
                                        
                                        <TextFieldUi
                                            label={t('appAdmin.EditTabsComponent.institute')}
                                            placeholder={t('appAdmin.EditTabsComponent.institutePlaceholder')}
                                            value={s.institute || ''}
                                            onChange={e => onStudiesChange?.(arr => arr.map((x, idx) => idx === i ? { ...x, institute: e.target.value } : x))}
                                        />

                                        <div className={styles['edit-card__row']}>
                                            {(() => {
                                                const isStandard = !s.type?.code || (studiesTypes.some(st => st.code === s.type?.code) && s.type?.code !== 'Otro');
                                                
                                                if (isStandard) {
                                                    return (
                                                        <SelectUi
                                                            label={t('appAdmin.EditTabsComponent.type')}
                                                            value={s.type?.code || ''}
                                                            onChange={e => {
                                                                const newType = studiesTypes.find(t => t.code === e.target.value);
                                                                onStudiesChange?.(arr => arr.map((x, idx) => idx === i ? { 
                                                                    ...x, 
                                                                    type: newType,
                                                                    type_other: newType?.code === 'Otro' ? (x.type_other || '') : '' 
                                                                } : x));
                                                            }}
                                                        >
                                                            {studiesTypes.map(type => <MenuItem key={type.code} value={type.code}>{type.label}</MenuItem>)}
                                                        </SelectUi>
                                                    );
                                                }

                                                return (
                                                    <TextFieldUi
                                                        label={t('appAdmin.EditTabsComponent.otherType', 'Especifique el tipo')}
                                                        value={s.type_other || (s.type?.code !== 'Otro' ? s.type?.code : '') || ''}
                                                        onChange={e => {
                                                            const val = e.target.value.slice(0, 50);
                                                            onStudiesChange?.(arr => arr.map((x, idx) => idx === i ? { 
                                                                ...x, 
                                                                type_other: val,
                                                                type: { code: val, label: val }
                                                            } : x));
                                                        }}
                                                        error={!!errors?.[`studies_type_other_${i}`]}
                                                        helperText={errors?.[`studies_type_other_${i}`] || `${(s.type_other || (s.type?.code !== 'Otro' ? s.type?.code : '') || '').length}/50`}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <Tooltip title={t('appAdmin.EditTabsComponent.backToSelection', 'Regresar al selector')}>
                                                                    <IconButton 
                                                                        size="small"
                                                                        onClick={() => onStudiesChange?.(arr => arr.map((x, idx) => idx === i ? { ...x, type: { code: '', label: '' }, type_other: '' } : x))}
                                                                        sx={{ color: '#6B8277' }}
                                                                    >
                                                                        <UndoRoundedIcon sx={{ fontSize: 18 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )
                                                        }}
                                                    />
                                                );
                                            })()}


                                            {loadingTags ? (
                                                <div className={styles['edit-card__loading']}><CircularProgress size={20} /></div>
                                            ) : (
                                                <MultiSelectUi
                                                    label={t('appAdmin.EditProfessionalInfo.specialtiesTags')}
                                                    options={availableTags.map(t => ({ uid: t.uid, name: t.name }))}
                                                    value={s.specialty ? [s.specialty.uid] : []}
                                                    maxLimit={1}
                                                    onChange={(selected) => {
                                                        const specialty = availableTags.find(t => t.uid === selected[0]);
                                                        onStudiesChange?.(arr => arr.map((x, idx) => idx === i ? { ...x, specialty: specialty || null } : x));
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <div className={styles['edit-card__row']}>
                                            <DateInputUi
                                                label={t('appAdmin.EditTabsComponent.dateStart')}
                                                value={s.date_start ? dayjs(s.date_start) : null}
                                                onChange={date => onStudiesChange?.(arr => arr.map((x, idx) => idx === i ? { ...x, date_start: date?.format('YYYY-MM-DD') } : x))}
                                            />
                                            <DateInputUi
                                                label={t('appAdmin.EditTabsComponent.dateEnd')}
                                                value={s.date_end ? dayjs(s.date_end) : null}
                                                onChange={date => onStudiesChange?.(arr => arr.map((x, idx) => idx === i ? { ...x, date_end: date?.format('YYYY-MM-DD') } : x))}
                                            />
                                        </div>

                                        <div className={styles['edit-card__file-section']}>
                                            <label className={styles['edit-card__label-small']}>{t('appAdmin.EditTabsComponent.fileCertificate')}</label>
                                            <div className={styles['edit-card__file-controls']}>
                                                <input
                                                    type="file"
                                                    accept="image/*,application/pdf"
                                                    id={`file-${i}`}
                                                    style={{ display: 'none' }}
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) onStudiesChange?.(arr => arr.map((x, idx) => idx === i ? { ...x, url_certificate: file } : x));
                                                    }}
                                                />
                                                <ButtonUi variant="outlined" size="small" onClick={() => document.getElementById(`file-${i}`)?.click()}>
                                                    {s.url_certificate ? t('appAdmin.EditTabsComponent.changeFile') : t('appAdmin.EditTabsComponent.uploadFileCertificate')}
                                                </ButtonUi>
                                                
                                                {s.url_certificate && (
                                                    <button 
                                                        type="button" 
                                                        className={styles['edit-card__view-link']}
                                                        onClick={() => {
                                                            const url = typeof s.url_certificate === 'string' ? `${process.env.REACT_APP_API_URL}${s.url_certificate}` : URL.createObjectURL(s.url_certificate as File);
                                                            handleOpenViewer(url, s.name || '');
                                                        }}
                                                    >
                                                        {t('appAdmin.EditTabsComponent.viewCertificate')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};