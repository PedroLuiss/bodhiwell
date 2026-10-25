import { DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { TextFieldProps } from '@mui/material/TextField';
import { Dayjs } from 'dayjs';

export interface DatePickerUiProps extends Omit<DatePickerProps, 'value' | 'onChange' | 'slotProps'> {
    value: string | null | Dayjs;
    onChange: (date: Dayjs | null) => void;
    slotProps?: {
        textField?: Partial<TextFieldProps>;
    };
}