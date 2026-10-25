import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import styles from './ConsultationsListProfessional.module.scss';
import { TableUi } from '../ui/Table/TableUi';
import { ColumnDefinitionTableUi } from '../ui/Table/types';
import { TextFieldUi } from '../ui/TextFieldUi/TextFieldUi';
import { Consultation } from '../../types/Consultations/Consultation.type';
import { usePatientConsultations } from '../../hooks/usePatientConsultations';
import Loading from '../ui/Loading/Loading';
import { useNavigate } from 'react-router-dom';
import { DateInputUi } from '../ui/DateInputUi/DateInputUi';
import { ButtonUi } from '../ui/ButtonUi/ButtonUi';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface ConsultationsListProfessionalProps {
  patientId: string;
}

export const ConsultationsListProfessional = ({ patientId }: ConsultationsListProfessionalProps) => {
  const { t } = useTranslation();
  const { consultations, loading, error } = usePatientConsultations(patientId);
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);
  const [reasonFilter, setReasonFilter] = useState('');
  const filteredData = useMemo(() => {
    return consultations.filter((consultation) => {
      const reasonMatch =
        !reasonFilter ||
        consultation.mainDiagnosis.toLowerCase().includes(reasonFilter.toLowerCase());
      const dateMatch =
        !dateFilter ||
        dayjs(consultation.consultationDate).isSame(dateFilter, 'day');

      return dateMatch && reasonMatch;
    });
  }, [consultations, dateFilter, reasonFilter]);

  const handleViewReport = (consultationId: string) => {
    navigate(`/my-consultation/${consultationId}/details-consultation`)
  };

  const columns: ColumnDefinitionTableUi<Consultation>[] = [
    {
      header: t('landing.TabsComponent.consultationsList.nameColumnHeaderPatient'),
      accessor: 'professionalName',
      sortable: true,
    },
    {
      header: t('landing.TabsComponent.consultationsList.dateColumnHeader'),
      accessor: 'consultationDate',
      sortable: true,
    },
    {
      header: t('landing.TabsComponent.consultationsList.diagnosisColumnHeader'),
      accessor: 'mainDiagnosis',
      sortable: true,
    },
    {
      header: t('landing.TabsComponent.consultationsList.actionColumnHeader'),
      accessor: 'actions',
      render: (item) => (
        <ButtonUi
          variant="outlined"
          size="small"
          onClick={() => handleViewReport(item.uid)}
          startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
        >
          {t('landing.TabsComponent.consultationsList.viewReportButton')}
        </ButtonUi>
      ),
    },
  ];

  if (loading) {
    return <Loading fullscreen text={t('landing.TabsComponent.consultationsList.loading', 'Cargando consultas...')} />;
  }

  if (error) {
    return <div className={styles['consultationsListError']}>{error}</div>;
  }

  return (
    <div className={styles['consultations-list']}>
      <div className={styles['filters-card']}>
        <div className={styles['filters-card__grid']}>
          <div className={styles['filters-card__item']}>
            <DateInputUi
              label={t('landing.TabsComponent.consultationsList.datePickerLabel')}
              value={dateFilter}
              onChange={(newDate) => setDateFilter(newDate)}
              placeholder={t('landing.TabsComponent.consultationsList.datePickerPlaceholder')}
            />
          </div>
          <div className={styles['filters-card__item']}>
            <TextFieldUi
              label={t('landing.TabsComponent.consultationsList.reasonPickerLabel')}
              placeholder={t('landing.TabsComponent.consultationsList.reasonPickerPlaceholder')}
              fullWidth
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <TableUi 
        columns={columns} 
        data={filteredData} 
        textempty={t('landing.TabsComponent.consultationsList.emptyText')} 
      />
    </div>
  );
};