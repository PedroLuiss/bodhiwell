import { Checkbox, styled } from '@mui/material';

export const CustomCheckbox = styled(Checkbox)(({ theme }) => ({
    padding: '4px 8px 4px 0',
    color: 'rgba(16, 25, 21, 0.20)',
    transition: 'all 0.2s ease',

    '& .MuiSvgIcon-root': {
        fontSize: 22,
    },

    '&.Mui-checked': {
        color: '#82B194',
    },
    '&:hover': {
        backgroundColor: 'rgba(130, 177, 148, 0.04)',
        color: '#82B194',
    },

    '&.Mui-disabled': {
        color: '#F1F2EF',
        opacity: 0.5,
    },
}));