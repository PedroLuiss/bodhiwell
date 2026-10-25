import dayjs from 'dayjs';
import { Tooltip } from '@mui/material';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { useTranslation } from 'react-i18next';

type AvailabilityMap = Map<number, { start: string; end: string }[]>;

export const createServerDay = (availabilityMap: AvailabilityMap) => {
    const { t } = useTranslation();
    return function ServerDay(props: PickersDayProps) {
        const { day, disabled, ...otherProps } = props;
        if (disabled) {
            return (
                <Tooltip title={t('landing.createServerDay.notAvailable')}>
                    <span><PickersDay {...props} /></span>
                </Tooltip>
            );
        }
        const availableSlots = availabilityMap.get(day.day());
        const tooltipMessage = (
            <div>
                <strong>{t('landing.createServerDay.availableSlots')}</strong>
                {availableSlots?.map((slot, index) => (
                    <div key={index}>
                        {dayjs(slot.start, 'HH:mm').format('h:mm A')} - {dayjs(slot.end, 'HH:mm').format('h:mm A')}
                    </div>
                ))}
            </div>
        );
        return (
            <Tooltip title={tooltipMessage}>
                <PickersDay {...props} />
            </Tooltip>
        );
    };
};