import { Button, styled } from "@mui/material";

export const CustomButton = styled(Button)(({ theme, variant, disabled }) => ({
    fontFamily: "'Sora', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    textTransform: 'none',
    boxShadow: 'none',
    borderRadius: '16px',
    fontWeight: 800,
    fontSize: '14px',
    minHeight: '38px',
    padding: '0 16px',
    transition: 'background .16s ease, border-color .16s ease, color .16s ease, transform .16s ease',

    [theme.breakpoints.down('sm')]: {
        fontSize: '13px',
        minHeight: '36px',
        padding: '0 12px',
        borderRadius: '14px',
    },
    
    '&:hover': {
        boxShadow: 'none !important',
        transform: 'translateY(-1px) !important',
    },
    
    '&:active': {
        transform: 'translateY(0) !important',
    },

    ...(variant === 'contained' && {
        backgroundColor: '#82B194',
        color: '#FFFFFF',
        border: '1px solid transparent',
        '&:hover': {
            backgroundColor: '#739F84',
            transform: 'translateY(-1px) !important',
            boxShadow: 'none !important',
        },
        '&:active': {
            backgroundColor: '#678F77',
        },
    }),

    ...(variant === 'outlined' && {
        backgroundColor: 'transparent',
        borderColor: 'rgba(130, 177, 148, .58)',
        color: '#32453b',
        borderWidth: '1px',
        '&:hover': {
            backgroundColor: 'rgba(130, 177, 148, .12)',
            transform: 'translateY(-1px) !important',
            boxShadow: 'none !important',
        },
        '&:active': {
            backgroundColor: 'rgba(130, 177, 148, .18)',
        },
    }),

    ...(variant === 'text' && {
        backgroundColor: '#F3F4F1',
        color: '#42534b',
        border: '1px solid rgba(16, 25, 21, .08)',
        '&:hover': {
            backgroundColor: '#ECEDE9',
            transform: 'translateY(-1px) !important',
            boxShadow: 'none !important',
        },
        '&:active': {
            backgroundColor: '#E3E5E1',
        },
    }),

    ...(disabled && {
        opacity: 0.58,
        pointerEvents: 'none',
        transform: 'none !important',
    }),
}));
