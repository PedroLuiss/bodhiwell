import React, { useState } from 'react';
import styles from './SelectionTypeAccount.module.scss';
import logo from '../../assets/images/Logo-bodhiwell.png';
import iconProfessional from '../auth/Icons/icons.png';
import iconPatient from '../auth/Icons/icon.png';
import useSelectionTypeAccount from '../../hooks/useSelectionTypeAccount';
import { Link } from 'react-router-dom';
import { ButtonUi } from '../../components/ui/ButtonUi/ButtonUi';

const SelectionTypeAccount: React.FC = () => {
    const { handleUpdateProfile, loading, error, t } = useSelectionTypeAccount();

    const [selectedType, setSelectedType] = useState<'professional' | 'patient' | null>(null);

    const handleContinue = () => {
        if (selectedType) {
            handleUpdateProfile(selectedType);
        }
    };

    return (
        <div className={styles['selection-account']}>
            <div className={styles['selection-account__wrapper']}>
                
                <header className={styles['selection-account__header']}>
                    <Link to="/">
                        <img src={logo} alt="bodhiWell" className={styles['selection-account__logo']} />
                    </Link>
                </header>

                <main className={styles['selection-account__card']}>
                    <div className={styles['selection-account__intro']}>
                        <h2 
                            className={styles['selection-account__title']} 
                            dangerouslySetInnerHTML={{ __html: t('landing.SelectionTypeAccount.welcomeTitle') }}
                        ></h2>
                        <p className={styles['selection-account__description']}>
                            {t('landing.SelectionTypeAccount.platformQuestion')}
                        </p>
                    </div>

                    <div className={styles['selection-account__grid']}>
                        
                        <button
                            type="button"
                            className={`${styles['option-card']} ${selectedType === 'professional' ? styles['option-card--selected'] : ''}`}
                            onClick={() => setSelectedType('professional')}
                            disabled={loading}
                        >
                            <div className={styles['option-card__icon-box']}>
                                <img src={iconProfessional} alt="" />
                            </div>
                            <div className={styles['option-card__content']}>
                                <h3 className={styles['option-card__title']}>
                                    {t('landing.SelectionTypeAccount.healthProfessional')}
                                </h3>
                                <p className={styles['option-card__text']}>
                                    {t('landing.SelectionTypeAccount.healthProfessionalDescription', 'Quiero ofrecer mis servicios y gestionar mi agenda.')}
                                </p>
                            </div>
                            {selectedType === 'professional' && <div className={styles['option-card__check']}>✓</div>}
                        </button>

                        {/* OPCIÓN: PACIENTE */}
                        <button
                            type="button"
                            className={`${styles['option-card']} ${selectedType === 'patient' ? styles['option-card--selected'] : ''}`}
                            onClick={() => setSelectedType('patient')}
                            disabled={loading}
                        >
                            <div className={styles['option-card__icon-box']}>
                                <img src={iconPatient} alt="" />
                            </div>
                            <div className={styles['option-card__content']}>
                                <h3 className={styles['option-card__title']}>
                                    {t('landing.SelectionTypeAccount.improveWellness')}
                                </h3>
                                <p className={styles['option-card__text']}>
                                    {t('landing.SelectionTypeAccount.improveWellnessDescription', 'Busco profesionales y quiero gestionar mis consultas.')}
                                </p>
                            </div>
                            {selectedType === 'patient' && <div className={styles['option-card__check']}>✓</div>}
                        </button>
                    </div>

                     <div className={`${styles['selection-account__actions']} ${selectedType ? styles['selection-account__actions--visible'] : ''}`}>
                        <ButtonUi 
                            variant="contained" 
                            onClick={handleContinue}
                            disabled={loading || !selectedType}
                            className={styles['selection-account__submit-btn']}
                        >
                            {loading ? t('landing.SelectionTypeAccount.processing') : t('landing.SelectionTypeAccount.continue', 'Continuar')}
                        </ButtonUi>
                    </div>


                    {error && (
                        <div className={styles['selection-account__error']}>
                            {error}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SelectionTypeAccount;