import React from 'react';
import { MenuItem } from '@mui/material';
import styles from './ProfessionalProfileTab.module.scss';
import { SelectUi } from '../../../../ui/SelectUi/SelectUi';
import { ProfessionalProfileTabProps } from './types/ProfessionalProfileTab.types';
import { useProfessionalProfileTab } from './hooks/useProfessionalProfileTab';

export const ProfessionalProfileTab: React.FC<ProfessionalProfileTabProps> = (props) => {
    const { editMode, professions, errors, loadingSpecialties } = props;

    const {
        t,
        selectedUid,
        handleProfessionChange,
        getSelectedProfessionName
    } = useProfessionalProfileTab({ ...props, loadingSpecialties });

    return (
        <div className={styles['profile-tab']}>
            <header className={styles['profile-tab__header']}>
                <h3 className={styles['profile-tab__title']}>
                    {t('appAdmin.EditTabsComponent.mainProfessionTabTitle', 'Definí tu identidad pública')}
                </h3>
                <p className={styles['profile-tab__description']}>
                    {t('appAdmin.EditTabsComponent.mainProfessionTabSubtitle', 'Seleccioná la profesión con la que querés aparecer resaltado en el listado de Bodhiwell.')}
                </p>
            </header>

            <div className={styles['profile-tab__selector-box']}>
                <SelectUi
                    label={t('appAdmin.EditProfessionalInfo.mainProfession', 'Profesión principal')}
                    displayEmpty
                    value={selectedUid}
                    onChange={handleProfessionChange}
                    disabled={!editMode}
                    error={!!errors?.['main_profession']}
                    helperText={errors?.['main_profession']}
                    renderValue={(selected: any) => {
                        if (!selected) {
                            return (
                                <span className={styles['profile-tab__placeholder']}>
                                    {t('appAdmin.EditProfessionalInfo.selectProfession', 'Seleccioná una opción...')}
                                </span>
                            );
                        }
                        return getSelectedProfessionName(selected);
                    }}
                >
                    <MenuItem disabled value="">
                        <em>{t('appAdmin.EditProfessionalInfo.mainProfession', 'Profesión principal')}</em>
                    </MenuItem>

                    {professions && professions.length > 0 ? (
                        professions.map((profession) => (
                            <MenuItem key={profession.uid} value={profession.uid}>
                                {profession.name}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled value="none">
                            <span className={styles['profile-tab__empty-msg']}>
                                {t('appAdmin.EditProfessionalInfo.noEligibleProfessions', 'Asegúrate de agregar una especialidad principal en la pestaña de Estudios.')}
                            </span>
                        </MenuItem>
                    )}
                </SelectUi>
            </div>

            <div className={styles['profile-tab__note']}>
                <span className={styles['profile-tab__note-icon']}>i</span>
                <p>{t('appAdmin.EditTabsComponent.mainProfessionNote', 'Solo podés elegir entre las profesiones validadas por tus estudios cargados.')}</p>
            </div>
        </div>
    );
};