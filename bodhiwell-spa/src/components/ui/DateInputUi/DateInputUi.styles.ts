import { SxProps, Theme } from '@mui/material';

export const CALENDAR_POPPER_SX: SxProps<Theme> = {
    '& .MuiPaper-root': {
        borderRadius: '24px',
        marginTop: '12px',
        border: '1px solid rgba(16, 25, 21, 0.08)',
        boxShadow: '0 15px 35px rgba(18, 34, 29, 0.12)',
        backgroundColor: '#F7F5F1',
        padding: '8px',
        width: 'auto !important',

        '@media (max-width: 400px)': {
            padding: '4px !important',
            '& .MuiPickersCalendarHeader-root': {
                paddingLeft: '4px !important',
                paddingRight: '4px !important',
            },
            '& .MuiPickersDay-root': {
                width: '32px !important',
                height: '32px !important',
                fontSize: '12px !important',
            },
            '& .MuiDayCalendar-header span': {
                width: '32px !important',
            }
        }
    },
    '& .MuiDateCalendar-root': {
        width: 'auto !important',
        overflow: 'hidden !important',
    },

    '& .MuiPickersSlideTransition-root': {
        overflow: 'hidden !important',
    },

    '& .MuiDayCalendar-monthContainer': {
    },
    '& .MuiPickersCalendarHeader-root': {
        paddingLeft: '12px',
        paddingRight: '12px',
        color: '#13231D',
    },
    '& .MuiPickersCalendarHeader-label': {
        fontSize: '14px',
        fontWeight: 800,
        fontFamily: "'Sora', sans-serif",
    },
    '& .MuiDayCalendar-header span': {
        fontFamily: "'Sora', sans-serif",
        fontWeight: 800,
        color: 'rgba(19, 35, 29, 0.5)',
        fontSize: '11px',
        textTransform: 'uppercase',
    },
    '& .MuiPickersDay-root': {
        fontFamily: "'Sora', sans-serif",
        fontSize: '13px',
        fontWeight: 600,
        borderRadius: '12px',
        color: '#13231D',
        '&:hover': {
            backgroundColor: 'rgba(130, 177, 148, 0.1)',
        },
        '&.Mui-selected': {
            backgroundColor: '#82B194 !important',
            color: '#fff !important',
            fontWeight: 800,
            '&:hover': {
                backgroundColor: '#739F84 !important',
            },
        },
        '&.MuiPickersDay-today': {
            borderColor: '#82B194',
            borderWidth: '1px',
        }
    }
};