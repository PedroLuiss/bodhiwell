import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";
import { useTranslation } from "react-i18next";
import styles from "./PatientProfileDetails.module.scss";
import { IPatient } from "../../types/Patient/Patient.type";
import PlaceholderImage from "../../assets/images/plaholderprofilewhite.png";
import TruncatedHtmlContent from "../ui/TruncatedHtmlContent/TruncatedHtmlContent";

interface PatientProfileDetailsProps {
  patient: IPatient;
}

const PatientProfileDetails: React.FC<PatientProfileDetailsProps> = ({
  patient,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const fullName = `${patient.first_name} ${patient.last_name}`.trim();
  const genderLabel =
    patient.details.gender === "male" ? t('appAdmin.PatientProfileDetails.male') :
    patient.details.gender === "female" ? t('appAdmin.PatientProfileDetails.female') :
    t('appAdmin.PatientProfileDetails.notSpecified');

  const birthDate = patient.details.date_birth;
  const formatDateBrief = formatDate(birthDate);



  return (
    <main className={styles['patient-view']}>
      
      <section className={`${styles['patient-card']} ${styles['patient-card--header']}`}>
        <div className={styles['patient-header']}>
          <div className={styles['patient-header__avatar-wrapper']}>
            <img
              src={patient.details.image ? `${process.env.REACT_APP_API_URL}${patient.details.image}` : PlaceholderImage}
              alt={fullName}
              className={styles['patient-header__avatar']}
            />
          </div>
          
          <div className={styles['patient-header__content']}>
            <div className={styles['patient-header__title-row']}>
              <h1 className={styles['patient-header__name']}>{fullName}</h1>
              <button 
                onClick={() => navigate(`/patients/${patient.uid}/history-consultation`)}
                className={styles['patient-header__history-btn']}
              >
                {t('appAdmin.PatientProfileDetails.consultationHistory')} ↗
              </button>
            </div>

            <div className={styles['patient-grid']}>
              <div className={styles['patient-item']}>
                <label className={styles['patient-item__label']}>{t('appAdmin.PatientProfileDetails.email')}</label>
                <p className={styles['patient-item__value']}>{patient.email}</p>
              </div>
              <div className={styles['patient-item']}>
                <label className={styles['patient-item__label']}>{t('appAdmin.PatientProfileDetails.phone')}</label>
                <p className={styles['patient-item__value']}>{patient.details.phone || '—'}</p>
              </div>
              <div className={styles['patient-item']}>
                <label className={styles['patient-item__label']}>{t('appAdmin.PatientProfileDetails.birthDate')}</label>
                <p className={styles['patient-item__value']}>{formatDateBrief}</p>
              </div>
              <div className={styles['patient-item']}>
                <label className={styles['patient-item__label']}>{t('appAdmin.PatientProfileDetails.gender')}</label>
                <p className={styles['patient-item__value']}>{genderLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles['patient-card']}>
        <h2 className={styles['patient-card__title']}>{t('appAdmin.PatientProfileDetails.address')}</h2>
        <div className={styles['patient-grid']}>
          <div className={styles['patient-item']}>
            <label className={styles['patient-item__label']}>{t('appAdmin.PatientProfileDetails.country')}</label>
            <p className={styles['patient-item__value']}>{patient.details.country || '—'}</p>
          </div>
          <div className={styles['patient-item']}>
            <label className={styles['patient-item__label']}>{t('appAdmin.PatientProfileDetails.city')}</label>
            <p className={styles['patient-item__value']}>{patient.details.city || '—'}</p>
          </div>
          <div className={styles['patient-item']}>
            <label className={styles['patient-item__label']}>{t('appAdmin.PatientProfileDetails.address')}</label>
            <p className={styles['patient-item__value']}>{patient.details.address || '—'}</p>
          </div>
          <div className={styles['patient-item']}>
            <label className={styles['patient-item__label']}>{t('appAdmin.PatientProfileDetails.zipCode')}</label>
            <p className={styles['patient-item__value']}>{patient.details.zipcode || '—'}</p>
          </div>
        </div>
      </section>

      <section className={styles['patient-card']}>
        <h2 className={styles['patient-card__title']}>
          {t('appAdmin.PatientProfileDetails.medicalConditionTitle')}
        </h2>
        <div className={styles['patient-card__rich-text']}>
          {patient.details.medical_condition ? (
            <TruncatedHtmlContent
              htmlContent={patient.details.medical_condition}
              maxLength={1000}
            />
          ) : (
            <p className={styles['patient-card__empty-text']}>
              {t('appAdmin.PatientProfileDetails.noMedicalInfoAvailable')}
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default PatientProfileDetails;