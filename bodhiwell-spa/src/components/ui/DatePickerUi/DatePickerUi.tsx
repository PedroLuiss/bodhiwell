import { useEffect, useMemo } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import { useTranslation } from 'react-i18next';
import { DatePickerUiProps } from './DatePickerUi.types';
import { CustomDatePicker } from './DatePickerUi.styles';

export const DatePickerUi = (props: DatePickerUiProps) => {
    const { value, onChange, slotProps: incomingSlotProps, ...rest } = props;
    const { i18n } = useTranslation();
    const currentLocale = i18n.language.startsWith('en') ? 'en' : 'es';
    
    useEffect(() => {
        dayjs.locale(currentLocale);
    }, [currentLocale]);

    const internalValue = value ? dayjs(value) : null;
    
    const mergedSlotProps = useMemo(() => {
        return {
            textField: {
                fullWidth: true,
                ...incomingSlotProps?.textField,
                sx: { ...incomingSlotProps?.textField?.sx },
            },
            day: {
                sx: {
                    '&.Mui-selected': {
                        backgroundColor: '#7A9E7E !important',
                        color: '#fff',
                        '&:hover, &:focus': {
                            backgroundColor: '#688a6c !important',
                        },
                    },
                },
            },
        };
    }, [incomingSlotProps]);
    
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={currentLocale}>
            <CustomDatePicker
                value={internalValue}
                onChange={onChange}
                {...rest}
                slotProps={mergedSlotProps}
            />
        </LocalizationProvider>
    );
};