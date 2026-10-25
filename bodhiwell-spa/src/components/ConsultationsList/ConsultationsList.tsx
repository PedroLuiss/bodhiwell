import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import styles from './ConsultationsList.module.scss';
import { TableUi } from '../ui/Table/TableUi';
import { ColumnDefinitionTableUi } from '../ui/Table/types';
import { Consultation } from '../../types/Consultations/Consultation.type';
import { useMyConsultations } from '../../hooks/useMyConsultations';
import Loading from '../ui/Loading/Loading';
import { useAuthContext } from '../../context/AuthContext';
import { ButtonUi } from '../ui/ButtonUi/ButtonUi';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { AdvancedFilters } from '../ui/AdvancedFilters/AdvancedFilters';
import { useDataFilter } from '../../hooks/useDataFilter';

export const ConsultationsList = () => {
  const { t } = useTranslation();
  const { consultations, loading, error } = useMyConsultations();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const {
    searchTerm, setSearchTerm,
    startDate, setStartDate,
    endDate, setEndDate,
    period, handlePeriodChange,
    filteredData
  } = useDataFilter<Consultation>({
    data: consultations,
    searchKeys: ['mainDiagnosis', 'patientName', 'professionalName'],
    dateKey: 'consultationDate'
  });

  const handleViewReport = useCallback((consultationId: string) => {
    navigate(`/my-consultation/${consultationId}/details-consultation`);
  }, [navigate]);

  const columns = useMemo((): ColumnDefinitionTableUi<Consultation>[] => {
    const isProf = user?.type_account === 'professional';
    const nameColumnHeader = isProf 
      ? t('landing.TabsComponent.consultationsList.nameColumnHeaderProfessional') 
      : t('landing.TabsComponent.consultationsList.nameColumnHeaderPatient');
    const nameColumnAccessor = isProf ? 'patientName' : 'professionalName';

    return [
      {
        header: nameColumnHeader,
        accessor: nameColumnAccessor,
        sortable: true,
        render: (item) => <span className={styles['text-name']}>{item[nameColumnAccessor]}</span>
      },
      {
        header: t('landing.TabsComponent.consultationsList.dateColumnHeader'),
        accessor: 'consultationDate',
        sortable: true,
        render: (item) => <span className={styles['text-date']}>{dayjs(item.consultationDate).format('DD/MM/YYYY')}</span>
      },
      {
        header: t('landing.TabsComponent.consultationsList.diagnosisColumnHeader'),
        accessor: 'mainDiagnosis',
        sortable: true,
        render: (item) => <span className={styles['text-diagnosis']}>{item.mainDiagnosis}</span>
      },
      {
        header: t('landing.TabsComponent.consultationsList.actionColumnHeader'),
        accessor: 'actions',
        render: (item) => (
          <ButtonUi
            variant="outlined"
            size="small"
            onClick={() => handleViewReport(item.uid)}
            startIcon={<VisibilityIcon sx={{ fontSize: 18 }} />}
          >
            {t('landing.TabsComponent.consultationsList.viewReportButton')}
          </ButtonUi>
        ),
      },
    ];
  }, [user, t, handleViewReport]);

  if (loading) {
    return <Loading fullscreen text={t('landing.TabsComponent.consultationsList.loading', 'Cargando consultas...')} />;
  }

  if (error) {
    return (
        <div className={styles['consultations-error']}>
            <p>{error}</p>
        </div>
    );
  }

  return (
    <div className={styles['consultations']}>

      <div className={styles['consultations__filters']}>
        <AdvancedFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          period={period}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      <div className={styles['consultations__table-container']}>
        <TableUi
          columns={columns}
          data={filteredData}
          textempty={t('landing.TabsComponent.consultationsList.emptyText')}
        />
      </div>
    </div>
  );
};