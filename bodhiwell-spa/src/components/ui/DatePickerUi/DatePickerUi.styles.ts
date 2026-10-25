
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export const CustomDatePicker = styled(DatePicker)(({ theme }) => ({
    width: '100%',
    '& .MuiOutlinedInput-root': {
        fontFamily: "'Sora', sans-serif",
        borderRadius: '8px',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#DDE2E7',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#333333',
        },

        '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#333333',
                borderWidth: '1px',
                boxShadow: 'none',
            },
            outline: 'none',
        },

        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.error.main,
        },
    },
    '& .MuiInputLabel-root': {
        color: '#445867',
        '&.Mui-focused': { color: '#445867' },
        '&.Mui-error': { color: theme.palette.error.main }
    },
    '& .MuiFormHelperText-root.Mui-error': {
        fontFamily: "'Sora', sans-serif",
    },
}));