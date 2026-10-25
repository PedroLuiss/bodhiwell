import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';

import { createServerDay } from '../../utils/calendarUtils';
import styles from './BookingPanel.module.scss';
import { IAvailabilityByDate } from '../../types';
import { useBookingProfessional } from '../../hooks/useBookingProfessional';
import { ButtonUi } from '../../components/ui/ButtonUi/ButtonUi'; 
import { CALENDAR_SX } from '../ProfessionalDetail/constant';

interface BookingPanelProps {
    professionalUid: string;
    availability: IAvailabilityByDate[] | undefined;
    viewsConfirmDate?: boolean;
    valueDate?: Dayjs | null | string;
    valueTime?: string;
    onDateChange?: (newDate: Dayjs | null) => void;
    onTimeChange?: (newTime: string) => void;
    loading?: boolean;
    setIsBookingModalOpen?: (open: boolean) => void;
    isApproved?: boolean;
}

export const BookingPanel: React.FC<BookingPanelProps> = ({
    professionalUid,
    availability,
    viewsConfirmDate = false,
    valueDate = null,
    valueTime = '',
    onDateChange,
    loading = false,
    isApproved = false,
}) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const currentLocale = i18n.language.startsWith('en') ? 'en' : 'es';

    useEffect(() => {
        dayjs.locale(currentLocale);
    }, [currentLocale]);

    const {
        selectedDate,
        availabilityMap,
        handleDateChange: internalHandleDateChange,
        shouldDisableDate,
    } = useBookingProfessional({
        professionalUid,
        availability,
        controlledDate: (valueDate === null || valueDate === undefined) ? undefined : dayjs(valueDate),
        controlledTime: valueTime
    });

    const isControlled = onDateChange !== undefined;
    const displayDate = isControlled ? (valueDate ? dayjs(valueDate) : null) : selectedDate;

    const ServerDay = useMemo(() => createServerDay(availabilityMap), [availabilityMap]);

    const handleDateUpdate = (newDate: Dayjs | null) => {
        if (onDateChange) {
            onDateChange(newDate);
        } else {
            internalHandleDateChange(newDate);
        }
    };

    const [currentMonth, setCurrentMonth] = React.useState<Dayjs>(displayDate || dayjs());

    useEffect(() => {
        if (displayDate) {
            setCurrentMonth(displayDate);
        }
    }, [displayDate]);

    const calendarHeight = useMemo(() => {
        const daysInMonth = currentMonth.daysInMonth();
        const firstDayOfWeek = currentLocale === 'es' ? 1 : 0;
        const startDay = currentMonth.startOf('month').day();
        const emptyDays = (startDay + 7 - firstDayOfWeek) % 7;
        const rows = Math.ceil((emptyDays + daysInMonth) / 7);
        const baseHeight = 36;
        const headerHeight = 50;
        return headerHeight + (rows * baseHeight) + 60;
    }, [currentMonth, currentLocale]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={currentLocale}>
            <aside className={styles['booking-panel']}>
                <section className={styles['booking-panel__card']}>
                    
                    {!viewsConfirmDate && (
                        <h3 className={styles['booking-panel__title']}>
                            {t('appAdmin.BookingPanel.title', 'Disponibilidad')}
                        </h3>
                    )}

                    <div className={styles['booking-panel__calendar-shell']}>
                        <DateCalendar
                            showDaysOutsideCurrentMonth
                            value={displayDate}
                            onChange={handleDateUpdate}
                            onMonthChange={(newMonth) => setCurrentMonth(newMonth)}
                            shouldDisableDate={shouldDisableDate}
                            loading={loading}
                            slots={{ day: ServerDay }}
                            views={['day']}
                            sx={{
                                ...CALENDAR_SX,
                                height: `${calendarHeight}px !important`,
                                minHeight: `${calendarHeight}px !important`,
                                transition: 'height 0.2s ease-in-out',
                            }}
                        />
                    </div>

                    {!viewsConfirmDate && (
                        <>
                            {!isApproved && (
                                <div className={styles['booking-panel__note']}>
                                    {t('appAdmin.BookingPanel.note', 'Este bloque se muestra como referencia visual hasta que el perfil sea aprobado.')}
                                </div>
                            )}

                            <div className={styles['booking-panel__actions']}>
                                {isApproved ? (
                                    <ButtonUi
                                        fullWidth
                                        variant="contained"
                                        onClick={() => navigate("/availability")}
                                    >
                                        {t('appAdmin.BookingPanel.editAvailability', 'Editar disponibilidad')}
                                    </ButtonUi>
                                ) : (
                                    <button 
                                        type="button"
                                        className={styles['booking-panel__btn-disabled']}
                                        disabled
                                    >
                                        {t('appAdmin.BookingPanel.editAvailability', 'Editar disponibilidad')}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </aside>
        </LocalizationProvider>
    );
};