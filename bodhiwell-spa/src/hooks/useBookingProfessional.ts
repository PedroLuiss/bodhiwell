import { useState, useMemo, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { IBookingRequest } from '../types/Booking/booking';
import { localStorageHelper } from '../utils/localStorageHelper';
import { IAvailabilityByDate } from '../types';

export interface TimeOption {
    value: string;
    disabled: boolean;
}

interface UseBookingProps {
    professionalUid: string;
    availability?: IAvailabilityByDate[] | undefined;
    controlledDate?: Dayjs | null;
    controlledTime?: string;
    consultTime?: number;
    modality?: string | null;
}

export const useBookingProfessional = ({
    professionalUid,
    availability,
    controlledDate,
    controlledTime,
    consultTime = 60,
    modality
}: UseBookingProps) => {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [timeError, setTimeError] = useState<string>('');

    const [bookingModality, setBookingModality] = useState<string>('');
    const [modalityTooltipOpen, setModalityTooltipOpen] = useState(false);

    const isControlled = controlledDate !== undefined;
    const currentDate = isControlled ? controlledDate : selectedDate;
    const currentTime = isControlled ? controlledTime : selectedTime;

    useMemo(() => {
        if (modality === 'Presencial') setBookingModality('Presencial');
        else if (modality === 'Virtual') setBookingModality('Virtual');
        else setBookingModality('');
    }, [modality]);


    const availabilityByDateMap = useMemo(() => {
        const map = new Map<string, { start: string; end: string }[]>();
        if (availability) {
            availability.forEach((day) => {
                const key = day.date;
                const slots = day.slots?.map(s => ({ start: s.start, end: s.end })) ?? [];
                const existing = map.get(key) || [];
                map.set(key, [...existing, ...slots]);
            });
        }
        return map;
    }, [availability]);

    const reservedTimesByDateMap = useMemo(() => {
        const map = new Map<string, Set<string>>();
        if (availability) {
            availability.forEach((day) => {
                const key = day.date;
                const reservedSet = new Set<string>();

                if (day.hasReservation && day.reservations) {
                    day.reservations.forEach(res => {
                        const timeStr = typeof res.reservationTime === 'string'
                            ? res.reservationTime
                            : (res.reservationTime as any).start || res.reservationTime;

                        const time = String(timeStr).substring(0, 5);
                        reservedSet.add(time);
                    });
                }
                map.set(key, reservedSet);
            });
        }
        return map;
    }, [availability]);

    const isTimeSelectionValid = useCallback((dateToValidate: Dayjs | null, timeToValidate: string): boolean => {
        if (!timeToValidate || !dateToValidate) return false;

        const key = dateToValidate.format('YYYY-MM-DD');

        const reservedTimes = reservedTimesByDateMap.get(key);
        if (reservedTimes && reservedTimes.has(timeToValidate)) {
            return false;
        }

        const userTime = dayjs(timeToValidate, 'HH:mm');
        if (!userTime.isValid()) return false;

        const [hh, mm] = timeToValidate.split(':').map(Number);
        const candidate = dateToValidate.hour(hh).minute(mm).second(0);
        if (dateToValidate.isSame(dayjs(), 'day') && candidate.isBefore(dayjs())) {
            return false;
        }

        const availableSlots = availabilityByDateMap.get(key);
        if (!availableSlots?.length) return false;

        return availableSlots.some(slot =>
            userTime.isSameOrAfter(dayjs(slot.start, 'HH:mm')) && userTime.isBefore(dayjs(slot.end, 'HH:mm'))
        );
    }, [availabilityByDateMap, reservedTimesByDateMap]);

    const handleDateChange = useCallback((newDate: Dayjs | null) => {
        setSelectedDate(newDate);
        setSelectedTime('');
        setTimeError('');
    }, []);

    const handleTimeChange = useCallback((time: string) => {
        setSelectedTime(time);
        if (timeError) setTimeError('');
    }, [timeError]);

    const validateTimeOnBlur = useCallback(() => {
        if (!currentTime || !currentDate) {
            setTimeError('');
            return;
        }
        const key = currentDate.format('YYYY-MM-DD');
        const reservedTimes = reservedTimesByDateMap.get(key);

        if (reservedTimes && reservedTimes.has(currentTime)) {
            setTimeError('Esta hora ya está reservada.');
            return;
        }

        const isValid = isTimeSelectionValid(currentDate, currentTime);
        setTimeError(isValid ? '' : 'La hora seleccionada no es válida.');
    }, [currentDate, currentTime, isTimeSelectionValid, reservedTimesByDateMap]);

    const handleBookNow = useCallback(() => {
        if (!professionalUid || !currentDate || !currentTime) return;

        const key = currentDate.format('YYYY-MM-DD');
        const reservedTimes = reservedTimesByDateMap.get(key);

        if (reservedTimes && reservedTimes.has(currentTime)) {
            setTimeError('Esta hora ya está reservada.');
            return;
        }

        if (timeError) return;

        if (modality === 'Presencial/Virtual' && !bookingModality) {
            setModalityTooltipOpen(true);
            return;
        }

        const [hours, minutes] = currentTime.split(':').map(Number);
        const bookingDateTime = currentDate.hour(hours).minute(minutes).second(0);
        const formattedDateTime = bookingDateTime.format('YYYY-MM-DD HH:mm:ss');

        let finalType = '';
        if (modality === 'Presencial') finalType = 'Presencial';
        else if (modality === 'Virtual') finalType = 'Virtual';
        else finalType = bookingModality;

        const bookingData: IBookingRequest = {
            professional_user_uid: professionalUid,
            date_booking_start: formattedDateTime,
            notes: "",
            type: finalType
        };

        const currentBookingDetails = localStorageHelper.getItem<any>('bookingDetails') || {};
        localStorageHelper.setItem('bookingDetails', {
            ...currentBookingDetails,
            ...bookingData,
            consult_type: finalType
        });

        return true;
    }, [professionalUid, currentDate, currentTime, timeError, reservedTimesByDateMap, modality, bookingModality]);

    const shouldDisableDate = useCallback((date: Dayjs) => {
        if (date.isBefore(dayjs(), 'day')) return true;
        
        const key = date.format('YYYY-MM-DD');
        const slots = availabilityByDateMap.get(key) || [];
        
        if (slots.length === 0) return true;

        return false;
    }, [availabilityByDateMap]);

    const timeOptions = useMemo((): TimeOption[] => {
        if (!currentDate) return [];
        const key = currentDate.format('YYYY-MM-DD');
        const slots = availabilityByDateMap.get(key) || [];
        if (!slots.length) return [];

        const reservedTimes = reservedTimesByDateMap.get(key);

        const stepMinutes = consultTime > 0 ? consultTime : 30;

        const optionsMap = new Map<string, TimeOption>();
        const now = dayjs();

        slots.forEach(({ start, end }) => {
            let cursor = dayjs(start, 'HH:mm');
            const endTime = dayjs(end, 'HH:mm');

            let cursorDateTime = currentDate.hour(cursor.hour()).minute(cursor.minute()).second(0);
            const endDateTime = currentDate.hour(endTime.hour()).minute(endTime.minute()).second(0);

            while (cursorDateTime.isBefore(endDateTime)) {

                const nextSlotTime = cursorDateTime.add(stepMinutes, 'minute');
                if (nextSlotTime.isAfter(endDateTime)) {
                    break;
                }

                const timeString = cursorDateTime.format('HH:mm');

                const isPast = currentDate.isSame(dayjs(), 'day') && cursorDateTime.isBefore(now);

                if (!isPast) {
                    const isReserved = reservedTimes ? reservedTimes.has(timeString) : false;

                    optionsMap.set(timeString, {
                        value: timeString,
                        disabled: isReserved
                    });
                }

                cursorDateTime = nextSlotTime;
            }
        });

        return Array.from(optionsMap.values()).sort((a, b) => a.value.localeCompare(b.value));

    }, [availabilityByDateMap, reservedTimesByDateMap, currentDate, consultTime]);

    const isBookingDisabled = !currentDate || !currentTime || !!timeError;

    const validateModality = useCallback((): boolean => {
        if (modality === 'Presencial/Virtual' && !bookingModality) {
            setModalityTooltipOpen(true);
            return false;
        }
        return true;
    }, [modality, bookingModality]);

    const saveBookingModality = useCallback(() => {
        let finalType = '';
        if (modality === 'Presencial') finalType = 'Presencial';
        else if (modality === 'Virtual') finalType = 'Virtual';
        else finalType = bookingModality;

        const currentBookingDetails = localStorageHelper.getItem<any>('bookingDetails') || {};
        localStorageHelper.setItem('bookingDetails', {
            ...currentBookingDetails,
            consult_type: finalType
        });
    }, [modality, bookingModality]);

    return {
        selectedDate,
        selectedTime,
        timeError,
        isBookingDisabled,
        availabilityMap: availabilityByDateMap,
        timeOptions,
        handleDateChange,
        handleTimeChange,
        validateTimeOnBlur,
        handleBookNow,
        shouldDisableDate,
        isTimeSelectionValid,
        bookingModality,
        setBookingModality,
        modalityTooltipOpen,
        setModalityTooltipOpen,
        validateModality,
        saveBookingModality
    };
};