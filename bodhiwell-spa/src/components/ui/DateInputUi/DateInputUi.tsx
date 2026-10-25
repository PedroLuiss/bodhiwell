import React, { useState, useMemo, useEffect } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { useTranslation } from 'react-i18next';
import { TextFieldUi } from '../TextFieldUi/TextFieldUi';
import { CALENDAR_POPPER_SX } from './DateInputUi.styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { InputAdornment, IconButton } from '@mui/material';

interface DateInputUiProps {
    label?: string;
    value: Dayjs | null;
    onChange: (date: Dayjs | null) => void;
    placeholder?: string;
    error?: boolean;
    helperText?: React.ReactNode;
    disabled?: boolean;
    fullWidth?: boolean;
}

export const DateInputUi = ({
    label,
    value,
    onChange,
    placeholder,
    error,
    helperText,
    disabled,
    fullWidth = true
}: DateInputUiProps) => {
    const { i18n } = useTranslation();
    const currentLocale = i18n.language.startsWith('en') ? 'en' : 'es';
    
    const [open, setOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState<Dayjs>(value || dayjs());

    useEffect(() => {
        if (value) {
            setCurrentMonth(value);
        }
    }, [value]);

    const calendarHeight = useMemo(() => {
        const daysInMonth = currentMonth.daysInMonth();
        const firstDayOfWeek = currentLocale === 'es' ? 1 : 0;
        const startDay = currentMonth.startOf('month').day();
        const emptyDays = (startDay + 7 - firstDayOfWeek) % 7;
        const rows = Math.ceil((emptyDays + daysInMonth) / 7);
        const baseHeight = 36;
        const headerHeight = 50;
        return headerHeight + (rows * baseHeight) + 70;
    }, [currentMonth, currentLocale]);

    const dynamicPopperSx = {
        ...CALENDAR_POPPER_SX,
        '& .MuiDateCalendar-root': {
            ...(CALENDAR_POPPER_SX as any)['& .MuiDateCalendar-root'],
            height: `${calendarHeight}px !important`,
            minHeight: `${calendarHeight}px !important`,
        },
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={currentLocale}>
            <DatePicker
                label={label}
                value={value}
                onChange={onChange}
                disabled={disabled}
                open={open}
                onClose={() => setOpen(false)}
                enableAccessibleFieldDOMStructure={false}
                slots={{
                    textField: TextFieldUi,
                }}
                slotProps={{
                    textField: {
                        label,
                        error,
                        helperText,
                        placeholder: placeholder || "DD/MM/AAAA",
                        fullWidth,
                        InputProps: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpen((prev) => !prev);
                                        }}
                                        disabled={disabled}
                                        sx={{ padding: '4px' }}
                                    >
                                        <CalendarTodayIcon sx={{ fontSize: 18, color: '#65756E' }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }
                    } as any,
                    popper: {
                        sx: dynamicPopperSx
                    }
                }}
                onMonthChange={(newMonth: Dayjs) => {
                    setCurrentMonth(newMonth);
                }}
            />
        </LocalizationProvider>
    );
};