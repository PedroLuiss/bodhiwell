import { TextField, styled, Theme } from '@mui/material';

export const CustomTextArea = styled(TextField)(({ theme }: { theme: Theme }) => ({
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
        '&.Mui-focused': {
            color: '#6B8277',
        },
        '&.Mui-error': {
            color: '#6B8277',
        },
    },

    '& .MuiOutlinedInput-root': {
        fontFamily: "'Sora', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
        borderRadius: '16px',
        backgroundColor: '#FFFFFF',
        transition: 'all 0.2s ease',
        fontSize: '15px',
        color: '#13231D',
        padding: '0 6px 0 0 !important', 
        height: '80px !important',
        alignItems: 'stretch',

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
                borderWidth: '1px',
            },
        },

        '&.Mui-error': {
            boxShadow: '0 0 0 4px rgba(201, 92, 92, 0.12)',
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(201, 92, 92, 0.72)',
            },
            '&.Mui-focused': {
                boxShadow: '0 0 0 4px rgba(201, 92, 92, 0.12)',
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
        
        '& .MuiOutlinedInput-input': {
            padding: '12px 16px !important',
            lineHeight: '1.5',
            boxSizing: 'border-box',
            height: '100% !important',
            overflowY: 'auto !important',
            overflowX: 'hidden !important',
            
            '&::-webkit-scrollbar': {
                width: '6px',
            },
            '&::-webkit-scrollbar-track': {
                background: 'transparent',
                margin: '8px 0', 
            },
            '&::-webkit-scrollbar-thumb': {
                background: 'rgba(19, 35, 29, 0.15)', 
                borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(19, 35, 29, 0.25)',
            },
        }
    },

    '& .MuiFormHelperText-root': {
        fontFamily: "'Sora', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
        fontSize: '11px',
        lineHeight: '1.65 !important',
        marginTop: '8px',
        marginLeft: '0',
        color: '#65756E',
        '&.Mui-error': {
            color: '#C95C5C',
        },
    },

    '& .MuiFormControl-root': {
        width: '100%',
    },

    [theme.breakpoints.down('sm')]: {
        '& .MuiInputLabel-root': {
            fontSize: '12px',
            marginBottom: '6px',
        },
        '& .MuiOutlinedInput-root': {
            height: '70px !important',
            padding: '0 4px 0 0 !important',
        },
    },
}));
