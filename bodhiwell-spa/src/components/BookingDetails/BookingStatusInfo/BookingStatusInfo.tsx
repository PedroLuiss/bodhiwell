import React from 'react';
import styles from './BookingStatusInfo.module.scss';
import { IBookingDetail } from '../../../types/Booking/booking';
import { useBookingStatusInfo } from './hooks/useBookingStatusInfo';
import { ButtonUi } from '../../ui/ButtonUi/ButtonUi';

interface BookingStatusInfoProps {
    bookingDetail: IBookingDetail;
    onAction?: () => void;
    isActionLoading?: boolean;
    userType?: 'professional' | 'patient';
    reservationDateTime?: string;
}

const BookingStatusInfo: React.FC<BookingStatusInfoProps> = ({
    bookingDetail,
    onAction,
    isActionLoading,
    userType = 'patient',
    reservationDateTime,
}) => {
    const { 
        config, 
        isVisible, 
        shouldShowAction, 
        formattedMessage, 
        t 
    } = useBookingStatusInfo({
        bookingDetail,
        userType,
        reservationDateTime,
        onAction
    });

    if (!isVisible || !config) return null;

    return (
        <div className={styles['status-info']}>
            <div className={styles['status-info__content']}>
                <span className={`${styles['status-info__badge']} ${styles[`status-info__badge--${config.badgeClass}`]}`}>
                    {t(config.badgeKey)}
                </span>

                <p className={styles['status-info__message']}>
                    {formattedMessage}
                </p>
            </div>

            {shouldShowAction && config.actionKey && (
                <div className={styles['status-info__action']}>
                    <ButtonUi 
                        variant="contained" 
                        onClick={onAction} 
                        disabled={isActionLoading}
                        fullWidth
                    >
                        {isActionLoading ? t('bookingStatus.loading') : t(config.actionKey)}
                    </ButtonUi>
                </div>
            )}
        </div>
    );
};

export default BookingStatusInfo;