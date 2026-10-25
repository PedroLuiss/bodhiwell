import { TextField, styled, Theme, SxProps } from '@mui/material';

export const CustomTextField = styled(TextField)(({ theme }: { theme: Theme }) => ({
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

    '& .MuiInputAdornment-root': {
        marginLeft: '0px !important',
        position: 'absolute',
        right: '9px',
    },
    '& .MuiOutlinedInput-root': {
        fontFamily: "'Sora', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
        borderRadius: '16px',
        backgroundColor: '#FFFFFF',
        minHeight: '50px',
        transition: 'all 0.2s ease',
        fontSize: '15px',
        color: '#13231D',
        padding: '0 !important',
        height: '50px !important',

        '& > input': {
            padding: '0 16px !important',
            height: '100% !important',
        },

        '&.MuiOutlinedInput-adornedEnd > input': {
            paddingRight: '48px !important',
        },

        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(16, 25, 21, 0.10)',
            borderWidth: '1px',
            top: 0,
            '& legend': { display: 'none' },
            padding: '0 16px !important',
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

        
    },

    '& input:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
        WebkitTextFillColor: '#13231D !important',
        transition: 'background-color 5000s ease-in-out 0s',
    },

    '& input:-webkit-autofill:focus': {
        WebkitBoxShadow: '0 0 0 1000px #E6EBE4 inset !important',
        WebkitTextFillColor: '#13231D !important',
    },

    '& .MuiInput-root': {
        '&:before, &:after': {
            display: 'none', 
        },
        '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
            WebkitTextFillColor: '#13231D !important',
        },
        '& input:-webkit-autofill:focus': {
            WebkitBoxShadow: '0 0 0 1000px #E6EBE4 inset !important',
            WebkitTextFillColor: '#13231D !important',
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
            minHeight: '46px',
            height: '46px !important',
            fontSize: '14px',
            borderRadius: '14px',
            '& > input': {
                padding: '0 14px !important',
            },
        },
        '& .MuiFormHelperText-root': {
            fontSize: '10px',
            marginTop: '6px',
        }
    },
}));

export const getNumberInputStyles = (type: string | undefined): SxProps<Theme> | undefined => {
    if (type === 'number') {
        return {
            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                '-webkit-appearance': 'none',
                margin: 0,
            },
            '& input[type=number]': {
                '-moz-appearance': 'textfield',
            },
        };
    }
    return undefined;
};