import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styles from "./ReservationsTable.module.scss";
import { TableUi } from "../ui/Table/TableUi";
import { ColumnDefinitionTableUi } from "../ui/Table/types";
import { useAuthContext } from "../../context/AuthContext";
import ActionMenu from "../ui/ActionMenu/ActionMenu";
import StatusBadge from "../ui/StatusBadge/StatusBadge";
import PreviewIcon from "@mui/icons-material/Preview";
import GradingIcon from "@mui/icons-material/Grading";
import FeedIcon from "@mui/icons-material/Feed";
import { IConsultation } from "../../types";

import { AdvancedFilters } from "../ui/AdvancedFilters/AdvancedFilters";
import { useDataFilter } from "../../hooks/useDataFilter";
import { BookingStatus } from "../../types/Booking/booking";

export interface ReservationsTableProps {
  data: IConsultation[];
}

export const ReservationsTable = ({ data }: ReservationsTableProps) => {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const {
    searchTerm, setSearchTerm,
    startDate, setStartDate,
    endDate, setEndDate,
    period, handlePeriodChange,
    filteredData,
  } = useDataFilter<IConsultation>({
    data,
    searchKeys: ["patient", "professional", "reserve_reason", "status"],
    dateKey: "date_start",
  });

  const canGenerateReport = (dateString: string): boolean => {
    const reservationDate = new Date(dateString.replace(" ", "T"));
    const today = new Date();
    return !isNaN(reservationDate.getTime()) && reservationDate.getTime() <= today.getTime();
  };

  const checkReminderActive = (item: IConsultation): boolean => {
    return item.status === 'CONFIRMED' && !item.isConsulted && canGenerateReport(item.date_start);
  };

  const columns = useMemo((): ColumnDefinitionTableUi<IConsultation>[] => {
    const isPatient = user?.type_account === "patient";

    return [
      {
        header: isPatient ? t("appAdmin.reservationsTable.professionalColumn") : t("appAdmin.reservationsTable.patientColumn"),
        accessor: isPatient ? "professional" : "patient",
        sortable: true,
        render: (item) => <span className={styles['cell-name']}>{isPatient ? item.professional : item.patient}</span>
      },
      {
        header: t("appAdmin.reservationsTable.dateTimeColumn"),
        accessor: "date_start",
        sortable: true,
        render: (item) => (
          <div className={styles['cell-date']}>
            <strong>{item.date_start.split(' ')[0]}</strong>
            <span>{item.date_start.split(' ')[1]}</span>
          </div>
        ),
      },
      {
        header: t("appAdmin.reservationsTable.reasonColumn"),
        accessor: "reserve_reason",
        render: (item) => (
          <p className={styles['cell-reason']}>
            {item.reserve_reason || <em className={styles['text-muted']}>No especificado</em>}
          </p>
        ),
      },
      {
        header: t("appAdmin.reservationsTable.statusColumn"),
        accessor: "status",
        sortable: true,
        render: (item) => <StatusBadge status={item.status as BookingStatus} />,
      },
      {
        header: t("appAdmin.reservationsTable.actionColumn"),
        accessor: "actions",
        render: (item) => {
          let menuOptions: React.ReactNode[] = [];
          
          menuOptions.push(
            <button key="view-res" className={styles['menu-btn']} onClick={() => navigate(`/professionals/booking-details/${item.uid}`)}>
              <GradingIcon sx={{ fontSize: 18 }} /> {t("appAdmin.reservationsTable.viewReservationButton")}
            </button>
          );

          if (isPatient) {
            if (Array.isArray(item.consultation) && item.consultation.length > 0) {
              menuOptions.push(
                <button key="view-rep" className={styles['menu-btn']} onClick={() => navigate(`/my-consultation/${item.consultation?.uid}/details-consultation`)}>
                  <PreviewIcon sx={{ fontSize: 18 }} /> {t("appAdmin.reservationsTable.viewReportButton")}
                </button>
              );
            }
          } else {
            if (item.isConsulted) {
              menuOptions.push(
                <button key="view-rep-prof" className={styles['menu-btn']} onClick={() => navigate(`/my-consultation/${item.consultation?.uid}/details-consultation`)}>
                  <PreviewIcon sx={{ fontSize: 18 }} /> {t("appAdmin.reservationsTable.viewReportButton")}
                </button>
              );
            } else if (item.status === 'CONFIRMED' && canGenerateReport(item.date_start)) {
              menuOptions.push(
                <button key="create-rep" className={`${styles['menu-btn']} ${styles['menu-btn--highlight']}`} onClick={() => navigate(`/reservations/${item.uid}/create-report`)}>
                  <FeedIcon sx={{ fontSize: 18 }} /> {t("appAdmin.reservationsTable.createReportButton")}
                </button>
              );
            }
          }
          return <ActionMenu options={menuOptions} />;
        },
      },
    ];
  }, [user, navigate, t]);

  return (
    <div className={styles['reservations']}>

      <div className={styles['reservations__filters']}>
        <AdvancedFilters
            searchTerm={searchTerm} onSearchChange={setSearchTerm}
            startDate={startDate} onStartDateChange={setStartDate}
            endDate={endDate} onEndDateChange={setEndDate}
            period={period} onPeriodChange={handlePeriodChange}
        />
      </div>

      <div className={styles['reservations__table']}>
        <TableUi 
          columns={columns} 
          data={filteredData}
          reminderConfig={user?.type_account !== 'patient' ? {
              checkIsActive: checkReminderActive,
              onToggle: (item) => navigate(`/reservations/${item.uid}/create-report`),
              tooltipTitle: t('appAdmin.reservationsTable.reminderTitle'),
              tooltipMessage: t('appAdmin.reservationsTable.reminderMessage'),
          } : undefined}
        />
      </div>
    </div>
  );
};