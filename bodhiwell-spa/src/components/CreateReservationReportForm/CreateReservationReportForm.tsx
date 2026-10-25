import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CreateReservationReportForm.module.scss';
import { useReservationReportForm } from '../../hooks/useReservationReportForm';
import { IReservationReportData } from '../../types';
import CustomQuillEditor from '../ui/TextEditorUi/CustomQuillEditor';
import { ButtonUi } from '../ui/ButtonUi/ButtonUi';
import SaveIcon from '@mui/icons-material/Save';
import CircularProgress from '@mui/material/CircularProgress';

interface CreateReservationReportFormProps {
  onSubmit: (data: IReservationReportData) => void;
  loading: boolean;
}

const CreateReservationReportForm: React.FC<CreateReservationReportFormProps> = ({ onSubmit, loading }) => {
  const { t } = useTranslation();
  const { formData, errors, handleChange, handleFroalaChange, handleSubmit } = useReservationReportForm({ onSubmit });

  return (
    <form className={styles['report-form']} onSubmit={handleSubmit} noValidate>
      
      <div className={styles['report-form__group']}>
        <label htmlFor="reason" className={styles['report-form__label']}>
            {t('appAdmin.CreateReservationReportForm.reasonLabel')}
        </label>
        <textarea
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          className={styles['report-form__textarea']}
          placeholder={t('appAdmin.CreateReservationReportForm.reasonPlaceholder')}
          rows={3}
        />
        {errors.reason && <span className={styles['report-form__error']}>{errors.reason}</span>}
      </div>

      <div className={styles['report-form__group']}>
        <label className={styles['report-form__label']}>
            {t('appAdmin.CreateReservationReportForm.observationsLabel')}
        </label>
        <div className={styles['report-form__editor-wrapper']}>
            <CustomQuillEditor
                value={formData.observations}
                onChange={handleFroalaChange}
                placeholder={t('appAdmin.CreateReservationReportForm.observationsPlaceholder')}
            />
        </div>
        {errors.observations && <span className={styles['report-form__error']}>{errors.observations}</span>}
      </div>

      <div className={styles['report-form__group']}>
        <label htmlFor="additionalNotes" className={styles['report-form__label']}>
            {t('appAdmin.CreateReservationReportForm.additionalNotesLabel')}
        </label>
        <textarea
          id="additionalNotes"
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleChange}
          className={styles['report-form__textarea']}
          placeholder={t('appAdmin.CreateReservationReportForm.additionalNotesPlaceholder')}
          rows={4}
        />
      </div>

      <div className={styles['report-form__actions']}>
        <ButtonUi 
            type="submit" 
            variant="contained" 
            disabled={loading}
            className={styles['report-form__submit-btn']}
            startIcon={!loading && <SaveIcon />}
        >
            {loading ? (
                <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    {t('appAdmin.CreateReservationReportForm.savingButton')}
                </>
            ) : t('appAdmin.CreateReservationReportForm.createReportButton')}
        </ButtonUi>
      </div>
    </form>
  );
};

export default CreateReservationReportForm;