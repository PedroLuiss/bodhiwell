import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { useBookingProfessional } from '../../../hooks/useBookingProfessional';
import { useAuthContext } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { createServerDay } from '../../../utils/calendarUtils';
import { BookingPanelProps } from '../types';

export const useBookingPanel = ({
    professionalUid,
    availability,
    valueDate,
    valueTime,
    onDateChange,
    onTimeChange,
    modality,
    consultTime,
    setIsBookingModalOpen,
}: BookingPanelProps) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthContext();
    const { showNotification } = useNotification();

    const currentLocale = i18n.language.startsWith('en') ? 'en' : 'es';

    useEffect(() => {
        dayjs.locale(currentLocale);
    }, [currentLocale]);

    const {
        selectedDate,
        selectedTime,
        timeError,
        availabilityMap,
        timeOptions,
        handleDateChange: internalHandleDateChange,
        handleTimeChange: internalHandleTimeChange,
        validateTimeOnBlur,
        handleBookNow,
        shouldDisableDate,
        bookingModality,
        setBookingModality,
        modalityTooltipOpen,
        setModalityTooltipOpen
    } = useBookingProfessional({
        professionalUid,
        availability,
        controlledDate: valueDate === null || valueDate === undefined ? undefined : dayjs(valueDate),
        controlledTime: valueTime,
        consultTime: consultTime ? Number(consultTime) : undefined,
        modality,
    });

    const ServerDay = useMemo(() => createServerDay(availabilityMap), [availabilityMap]);

    const isControlled = onDateChange !== undefined;
    const displayDate = isControlled ? (valueDate ? dayjs(valueDate) : null) : selectedDate;
    const displayTime = isControlled ? valueTime : selectedTime;

    const [dayTooltipOpen, setDayTooltipOpen] = useState(false);
    const [timeTooltipOpen, setTimeTooltipOpen] = useState(false)
    const [selectDayFirstTooltipOpen, setSelectDayFirstTooltipOpen] = useState(false);

    const [currentMonth, setCurrentMonth] = useState<Dayjs>(displayDate || dayjs());

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

    useEffect(() => {
        if (dayTooltipOpen) {
            const timer = setTimeout(() => setDayTooltipOpen(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [dayTooltipOpen]);

    useEffect(() => {
        if (timeTooltipOpen) {
            const timer = setTimeout(() => setTimeTooltipOpen(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [timeTooltipOpen]);

    useEffect(() => {
        if (selectDayFirstTooltipOpen) {
            const timer = setTimeout(() => setSelectDayFirstTooltipOpen(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [selectDayFirstTooltipOpen]);

    useEffect(() => {
        if (modalityTooltipOpen) {
            const timer = setTimeout(() => setModalityTooltipOpen(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [modalityTooltipOpen, setModalityTooltipOpen]);

    const handleDateUpdate = useCallback((newDate: Dayjs | null) => {
        if (onDateChange) onDateChange(newDate);
        else internalHandleDateChange(newDate);
        setDayTooltipOpen(false);
        setSelectDayFirstTooltipOpen(false);
    }, [onDateChange, internalHandleDateChange]);

    const handleTimeUpdate = useCallback((newTime: string) => {
        if (onTimeChange) onTimeChange(newTime);
        else internalHandleTimeChange(newTime);
        setTimeTooltipOpen(false);
        setSelectDayFirstTooltipOpen(false);
    }, [onTimeChange, internalHandleTimeChange]);

    const handleShowBookingModal = useCallback(() => {
        if (!isAuthenticated) {
            showNotification(t('landing.professionalsDetail.bookingPanel.errorBooking'), 'error', 2000);
            navigate('/login');
            return;
        }

        if (!user?.type_account) {
            showNotification(
                t('landing.professionalsDetail.bookingPanel.completeProfileFirst', 'Por favor, selecciona si eres paciente o profesional para continuar.'),
                'warning',
                4000
            );
            navigate('/selection-type-account');
            return;
        }

        let hasError = false;

        if (!displayDate) {
            setDayTooltipOpen(true);
            hasError = true;
        }

        if (modality === 'Presencial/Virtual' && !bookingModality) {
            setModalityTooltipOpen(true);
            hasError = true;
        }

        if (!displayTime) {
            setTimeTooltipOpen(true);
            hasError = true;
        }

        if (hasError) return;

        const isSave = handleBookNow();
        if (isSave && setIsBookingModalOpen) {
            setIsBookingModalOpen(true);
        }
    }, [isAuthenticated, user?.type_account, displayDate, modality, bookingModality, displayTime, handleBookNow, setIsBookingModalOpen, navigate, showNotification, t, setModalityTooltipOpen]);

    return {
        t,
        currentLocale,
        displayDate,
        displayTime,
        timeOptions,
        timeError,
        ServerDay,
        dayTooltipOpen,
        timeTooltipOpen,
        selectDayFirstTooltipOpen,
        bookingModality,
        modalityTooltipOpen,
        setDayTooltipOpen,
        setTimeTooltipOpen,
        setSelectDayFirstTooltipOpen,
        setBookingModality,
        setModalityTooltipOpen,
        handleDateUpdate,
        handleTimeUpdate,
        handleShowBookingModal,
        shouldDisableDate,
        validateTimeOnBlur,
        calendarHeight,
        setCurrentMonth,
    };
};
