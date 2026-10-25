import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { IBookingDetail } from '../../../../types/Booking/booking';
import { PATIENT_STATUS_CONFIG, PROFESSIONAL_STATUS_CONFIG } from '../constants/BookingStatus.constants';

interface UseBookingStatusProps {
    bookingDetail: IBookingDetail;
    userType: 'professional' | 'patient';
    reservationDateTime?: string;
    onAction?: () => void;
}

export const useBookingStatusInfo = ({
    bookingDetail,
    userType,
    reservationDateTime,
    onAction
}: UseBookingStatusProps) => {
    const { t } = useTranslation();

    const config = useMemo(() => {
        const statusMap = userType === 'professional' ? PROFESSIONAL_STATUS_CONFIG : PATIENT_STATUS_CONFIG;
        return statusMap[bookingDetail.status];
    }, [userType, bookingDetail.status]);

    const isVisible = useMemo(() => {
        if (!config) return false;
        if (userType === 'professional' && bookingDetail.status === 'CANCELLED') return false;
        return true;
    }, [config, userType, bookingDetail.status]);

    const shouldShowAction = useMemo(() => {
        if (!config?.actionKey || !onAction) return false;

        if (userType === 'professional' && bookingDetail.status === 'CONFIRMED' && reservationDateTime) {
            return dayjs().isAfter(dayjs(reservationDateTime));
        }

        return true;
    }, [config, onAction, userType, bookingDetail.status, reservationDateTime]);

    const formattedMessage = useMemo(() => {
        if (!config?.messageKey) return '';
        
        const dateStart = dayjs(bookingDetail.date_start);
        return t(config.messageKey, { 
            date: dateStart.format('DD/MM/YYYY'), 
            time: dateStart.format('h:mm A') 
        });
    }, [config, bookingDetail.date_start, t]);

    return {
        config,
        isVisible,
        shouldShowAction,
        formattedMessage,
        t
    };
};