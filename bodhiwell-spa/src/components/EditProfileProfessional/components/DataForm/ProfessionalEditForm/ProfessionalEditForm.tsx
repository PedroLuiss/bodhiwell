import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    FormControl,
    MenuItem,
    InputAdornment
} from '@mui/material';
import { SelectUi } from '../../../../ui/SelectUi/SelectUi';
import { TextFieldUi } from '../../../../ui/TextFieldUi/TextFieldUi';
import { MODALITY_OPTIONS } from '../../../../../constants';
import styles from './ProfessionalEditForm.module.scss';
import { ProfessionalEditFormProps } from './types';

export const ProfessionalEditForm: React.FC<ProfessionalEditFormProps> = ({
    form,
    errors,
    setFieldValue,
}) => {
    const { t, i18n } = useTranslation();

    return (
        <section className={styles['card']}>
            <h3>{t('appAdmin.EditProfessionalInfo.publicInfoTitle', 'Información pública')}</h3>
            <p className={styles['card-desc']}>
                {t('appAdmin.EditProfessionalInfo.publicInfoDesc', 'Datos visibles en tu perfil y resultados derivados de la información académica cargada.')}
            </p>

            <div className={styles['fields']}>
                <div className={styles['field']}>
                    <label className={styles['label']}>{t('appAdmin.EditProfessionalInfo.firstName')}</label>
                    <TextFieldUi
                        value={form.first_name}
                        onChange={e => setFieldValue('first_name', e.target.value)}
                        error={!!errors.first_name}
                        helperText={errors.first_name}
                        fullWidth
                        placeholder="Ej. Andrés"
                    />
                </div>

                <div className={styles['field']}>
                    <label className={styles['label']}>{t('appAdmin.EditProfessionalInfo.lastName')}</label>
                    <TextFieldUi
                        value={form.last_name}
                        onChange={e => setFieldValue('last_name', e.target.value)}
                        error={!!errors.last_name}
                        helperText={errors.last_name}
                        fullWidth
                        placeholder="Ej. Camarano"
                    />
                </div>

                <div className={styles['field']}>
                    <label className={styles['label']}>{t('appAdmin.EditProfessionalInfo.consultationPrice')}</label>
                    <TextFieldUi
                        type="number"
                        value={form.details.consult_price}
                        onChange={e => setFieldValue('details.consult_price', e.target.value)}
                        error={!!errors.consult_price}
                        helperText={errors.consult_price}
                        fullWidth
                        InputProps={{
                            endAdornment: <InputAdornment position="end">UYU</InputAdornment>,
                        }}
                    />
                </div>

                <div className={styles['field']}>
                    <label className={styles['label']}>{t('appAdmin.EditProfessionalInfo.modality')}</label>
                    <FormControl fullWidth>
                        <SelectUi
                            value={form.details.modality || ""}
                            onChange={e => setFieldValue('details.modality', e.target.value)}
                            error={!!errors.modality}
                        >
                            <MenuItem value=""><em>{t('appAdmin.EditProfessionalInfo.selectModality')}</em></MenuItem>
                            {MODALITY_OPTIONS.map(option => (
                                <MenuItem key={option.value} value={option.label}>
                                    {i18n.language === 'es' ? option.label : option.labelEn}
                                </MenuItem>
                            ))}
                        </SelectUi>
                    </FormControl>
                </div>
            </div>

            <div className={styles['section-group']}>
                <label className={styles['label']}>{t('appAdmin.EditProfessionalInfo.mainProfession')}</label>
                <div className={styles['chips']}>
                    {form.details.main_profession?.name ? (
                        <span className={styles['chip']}>
                            {form.details.main_profession.name}
                        </span>
                    ) : (
                        <span className={styles['no-data']}>{t('appAdmin.EditProfessionalInfo.noProfession', 'Sin profesión')}</span>
                    )}
                </div>
            </div>

            <div className={styles['section-group']}>
                <label className={styles['label']}>{t('appAdmin.EditProfessionalInfo.specialtiesTags')}</label>
                <div className={styles['chips']}>
                    {form.studies?.filter((s: any) => !s.delete && s.specialty?.name).map((study: any, index: number) => (
                        <span key={index} className={`${styles['chip']} ${styles[`chip--${study.specialty?.dimension?.name?.toLowerCase() || 'cuerpo'}`]}`}>
                            {study.specialty.name}
                        </span>
                    ))}
                    {(!form.studies || form.studies.filter((s: any) => !s.delete).length === 0) && (
                        <span className={styles['no-data']}>{t('appAdmin.EditProfessionalInfo.noSpecialties', 'Sin especialidades')}</span>
                    )}
                </div>
            </div>

            <p className={styles['helper']}>
                {t('appAdmin.EditProfessionalInfo.validationFromStudies', 'Estos datos se derivan de la información académica cargada en tu perfil.')}
            </p>
        </section>
    );
};