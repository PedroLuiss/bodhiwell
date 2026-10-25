import dayjs from 'dayjs';
import { Tooltip } from '@mui/material';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';

type AvailabilityMap = Map<string, { start: string; end: string }[]>;

export const createServerDay = (availabilityMap: AvailabilityMap) => {

    return function ServerDay(props: PickersDayProps) {
        const { day, disabled, outsideCurrentMonth } = props;

        const currentDay = day as dayjs.Dayjs;

        if (disabled || outsideCurrentMonth) {
            return (
                <PickersDay {...props} disabled={disabled || outsideCurrentMonth} />
            );
        }

        const dateKey = currentDay.format('YYYY-MM-DD');
        const availableSlots = availabilityMap.get(dateKey);

        const renderTooltipContent = () => {
            if (!availableSlots || availableSlots.length === 0) return null;

            return (
                <div style={{ textAlign: 'center' }}>
                    <strong>Horarios disponibles:</strong>
                    {availableSlots.map((slot, index) => (
                        <div key={index}>
                            {dayjs(slot.start, 'HH:mm').format('h:mm A')} - {dayjs(slot.end, 'HH:mm').format('h:mm A')}
                        </div>
                    ))}
                </div>
            );
        };

        if (availableSlots && availableSlots.length > 0) {
            return (
                <Tooltip title={renderTooltipContent()} arrow placement="top">
                    <PickersDay {...props} className={`${props.className} available-day`} />
                </Tooltip>
            );
        }

        return (
            <PickersDay {...props} />
        );
    };
};