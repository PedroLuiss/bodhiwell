import { FormControl, styled, Theme } from '@mui/material';

export const CustomFormControl = styled(FormControl)(({ theme }: { theme: Theme }) => ({
    width: '100%',

    '& .MuiInputLabel-root': {
        position: 'relative',
        transform: 'none',
        marginBottom: '8px',
        fontSize: '13px',
        fontWeight: 800,
        color: '#6B8277',
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        fontFamily: "'Sora', sans-serif",
        display: 'block',
        
        '&.Mui-focused': { color: '#6B8277' },
        '&.Mui-error': { color: '#6B8277' },
    },

    '& .MuiOutlinedInput-root': {
        fontFamily: "'Sora', sans-serif",
        borderRadius: '16px',
        backgroundColor: '#FFFFFF',
        minHeight: '50px',
        height: '50px',
        transition: 'all 0.2s ease',
        fontSize: '15px',
        color: '#13231D',

        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(16, 25, 21, 0.10)',
            borderWidth: '1px',
            top: 0,
            '& legend': { display: 'none' },
        },

        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(16, 25, 21, 0.20)',
        },

        '&.Mui-focused': {
            boxShadow: '0 0 0 4px rgba(130, 177, 148, 0.14)',
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(130, 177, 148, 0.72)',
            },
        },

        '&.Mui-error': {
            boxShadow: '0 0 0 4px rgba(201, 92, 92, 0.12)',
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(201, 92, 92, 0.72)',
            },
        },

        '&.Mui-disabled': {
            opacity: 0.48,
            backgroundColor: '#F1F2EF',
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(16, 25, 21, 0.10)',
            },
        },
    },

    '& .MuiSelect-select': {
        padding: '14px 16px !important',
        paddingRight: '40px !important',
        display: 'block !important',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontFamily: "'Sora', sans-serif",
    },
   

    '& .MuiSelect-icon': {
        right: '12px',
        color: '#65756E',
    },

    '& .MuiFormHelperText-root': {
        fontFamily: "'Sora', sans-serif",
        fontSize: '11px',
        lineHeight: '1.65',
        marginTop: '8px',
        marginLeft: '0',
        color: '#65756E',
        '&.Mui-error': { color: '#C95C5C', fontWeight: 600 },
    },

    [theme.breakpoints.down('sm')]: {
        '& .MuiInputLabel-root': {
            fontSize: '12px',
            marginBottom: '6px',
        },
        '& .MuiOutlinedInput-root': {
            minHeight: '46px',
            height: '46px !important',
            fontSize: '14px',
            borderRadius: '14px',
        },
        '& .MuiSelect-select': {
            padding: '12px 14px !important',
        },
        '& .MuiFormHelperText-root': {
            fontSize: '10px',
            marginTop: '6px',
        }
    },
}));