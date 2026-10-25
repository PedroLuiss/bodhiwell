import { TooltipProps } from "@mui/material";

export const ERROR_TOOLTIP_PROPS: Partial<TooltipProps> = {
    placement: "top",
    arrow: true,
    disableHoverListener: true,
    disableFocusListener: true,
    disableTouchListener: true,
    componentsProps: {
        tooltip: {
            sx: {
                bgcolor: '#d32f2f',
                fontSize: '13px'
            }
        },
        arrow: {
            sx: {
                color: '#d32f2f'
            }
        }
    }
};

export const CALENDAR_SX = {
    width: '100%',
    backgroundColor: '#F7F5F1', 
    border: '1px solid rgba(16,25,21,.08)',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,.03)',
    padding: '16px 16px 14px',
    margin: 0,
    height: 'auto',
    minHeight: 'auto',
    overflow: 'hidden',
    fontFamily: '"Sora", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',

    '& .MuiPickersCalendarHeader-root': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 0,
        margin: '0 0 12px 0',
        minHeight: 'auto',
    },
   
    '& .MuiPickersCalendarHeader-labelContainer': {
        margin: 0,
        fontSize: '13px', 
        fontWeight: 700,
        color: '#13231d', 
        fontFamily: '"Sora", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    },
    '& .MuiPickersArrowSwitcher-root': {
        display: 'flex',
        gap: '0px', 
    },
    '& .MuiPickersArrowSwitcher-button': {
        color: 'rgb(19 35 29 / 96%)', 
        padding: 0,
        width: 11,
        '&:hover': { backgroundColor: 'transparent', color: '#13231d' },
    },
    '& .MuiDayCalendar-header': {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        justifyContent: 'center',
        marginBottom: '0px',
    },
    '& .MuiDayCalendar-weekDayLabel': {
        fontFamily: '"Sora", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
        height: 'fit-content',
        fontSize: '10px',
        fontWeight: 700,
        padding: '2px 0',
    },
    '& .MuiDayCalendar-weekHeader span': {
        width: 'auto',
        height: 'auto',
        fontSize: '10px', 
        fontWeight: 700,
        color: 'rgba(19, 35, 29, .68)',
        padding: '4px 0',
        margin: 0,
        fontFamily: '"Sora", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    },
    '& .MuiDayCalendar-monthContainer': {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        position: 'relative',
        overflow: 'hidden',
    },
    '& .MuiDayCalendar-weekContainer': {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        margin: 0,
    },
    '& .MuiPickersArrowSwitcher-button svg': {
        width: '18px',
        height: 'auto',
        fontSize: '18px',
    },

    '& .MuiPickersDay-root': {
        margin: 0,
        fontSize: '12px',
        fontWeight: 600,
        color: '#55655d !important',
        borderRadius: '12px',
        aspectRatio: ' 1 / 1 ',
        fontFamily: '"Sora", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
        border: 'none',
        backgroundColor: 'transparent',
        transition: 'all 0.2s ease',

        '&:hover': {
            backgroundColor: 'rgba(130, 177, 148, 0.1)',
        },

        '&.MuiPickersDay-dayOutsideMonth': {
            color: 'rgba(19,35,29,.28) !important',
            pointerEvents: 'none',
        },

        '&.Mui-selected': {
            backgroundColor: '#82B194 !important', 
            color: 'white !important',
            fontWeight: 700,
            '&:hover': { backgroundColor: '#739F84 !important' },
        },
        '&.available-day:not(.Mui-selected)': {
            boxShadow: 'inset 0 0 0 2px #82B194',
            backgroundColor: '#EAF2EC',
            color: '#13231D !important',
        },

        '&.Mui-disabled': {
            color: 'rgba(19, 35, 29, 0.28) !important',
            boxShadow: 'none',
            backgroundColor: 'transparent',
            pointerEvents: 'none',
        }
    },

    '& .MuiPickersCalendarHeader-switchViewButton': { display: 'none' },
    '& .MuiDateCalendar-viewTransitionContainer': { 
        padding: 0,
        overflow: 'hidden',
    },
    '& .MuiPickersSlideTransition-root.MuiDayCalendar-slideTransition': {
        minHeight: '200px',
        overflow: 'hidden',
        display: 'grid',
        '& > *': {
            gridColumn: 1,
            gridRow: 1,
        }
    },

    '@media (max-width: 400px)': {
        padding: '12px 10px 10px',
        height: 'auto',
        minHeight: 'auto',
        '& .MuiDayCalendar-monthContainer': {
            gap: '4px',
        },
        '& .MuiPickersDay-root': {
            width: '28px',
            height: '28px',
            minWidth: '28px',
            fontSize: '11px',
        },
        '& .MuiDayCalendar-weekDayLabel': {
            width: '28px',
            height: '28px',
            fontSize: '9px',
        },
        '& .MuiPickersCalendarHeader-labelContainer': {
            fontSize: '12px',
        },
        '& .MuiPickersArrowSwitcher-button svg': {
            fontSize: '16px',
        }
    },
};
// export const CALENDAR_SX = {
//     width: '100%',
//     backgroundColor: 'transparent', 
//     border: 'none',
//     boxShadow: 'none',
//     padding: 0,
//     margin: 0,
//     height: 'auto',
//     fontFamily: '"Sora", sans-serif',
//     '& .MuiButtonBase-root-MuiPickersDay-root': {
//         color: 'red',
//     },
//     '& .MuiPickersCalendarHeader-root': {
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: '0 8px',
//         margin: '0 0 14px 0',
//     },
//     '& .MuiPickersCalendarHeader-labelContainer': {
//         margin: 0,
//         fontSize: '15px', 
//         fontWeight: 700,
//         color: '#13231d', 
//         letterSpacing: '-.02em',
//     },
//     '& .MuiPickersArrowSwitcher-button': {
//         color: 'rgba(19, 35, 29, .46)',
//         '&:hover': { backgroundColor: 'transparent', color: '#13231d' },
//     },
//     '& .MuiDayCalendar-header': {
//         display: 'grid',
//         gridTemplateColumns: 'repeat(7, 1fr)',
//         justifyContent: 'center',
//         marginBottom: '0px',
//         justifyItems: 'center',
//     },
//     '& .MuiDayCalendar-weekDayLabel': {
//         fontFamily: '"Sora", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
//         fontSize: '12px',
//         fontWeight: 700,
//         padding: '4px 0',
//         color: '#13231d75',
//         height: '20px',
//     },
//     '& .MuiDayCalendar-weekHeader span': {
//         width: 'auto',
//         height: 'auto',
//         fontSize: '10px', 
//         fontWeight: 700,
//         color: 'rgba(19, 35, 29, .68)',
//         padding: '4px 0',
//         margin: 0,
//         fontFamily: '"Sora", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
//     },
//     '& .MuiDayCalendar-monthContainer': {
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '5px',
//     },
//     '& .MuiDayCalendar-weekContainer': {
//         display: 'grid',
//         gridTemplateColumns: 'repeat(7, 1fr)',
//         justifyContent: 'center',
//         gap: '4px',
//         margin: '4px 0'
//     },
//     '& .MuiPickersDay-root': {
//         width: '36px',
//         height: '36px',
//         fontSize: '12px',
//         fontWeight: 700,
//         borderRadius: '12px', 
//         color: 'rgba(19, 35, 29, .68)',
//         backgroundColor: 'transparent',
//         border: '1px solid transparent',
//         transition: 'all 0.2s ease',

//         '&:hover': {
//             backgroundColor: 'rgba(19, 35, 29, 0.05)',
//         },


//         '&.Mui-selected': {
//             backgroundColor: 'transparent !important',
//             borderColor: 'rgba(19, 35, 29, 0.26) !important',
//             color: '#13231d !important',
//             fontWeight: 800,
//         },

//         '&.MuiPickersDay-dayOutsideMonth': {
//             color: 'rgba(19, 35, 29, .28)',
//         },
//     },

//     '& .MuiPickersCalendarHeader-switchViewButton': { display: 'none' },
//     '& .MuiDateCalendar-viewTransitionContainer': { 
//         padding: 0,
//     },

//     '& .MuiPickersDay-root.Mui-disabled:not(.Mui-selected)': {
//         color: '#13231dad',
//     },

//     '@media (max-width: 400px)': {
//         padding: '12px 10px 10px',
//         height: '15rem',
//         minHeight: '15rem',
//         '& .MuiDayCalendar-monthContainer': {
//             gap: '4px',
//         },
//         '& .MuiPickersDay-root': {
//             width: '28px',
//             height: '28px',
//             minWidth: '28px',
//             fontSize: '11px',
//         },
//         '& .MuiDayCalendar-weekDayLabel': {
//             width: '28px',
//             height: '28px',
//             fontSize: '9px',
//         },
//         '& .MuiPickersCalendarHeader-labelContainer': {
//             fontSize: '12px',
//         },
//         '& .MuiPickersArrowSwitcher-button svg': {
//             fontSize: '16px',
//         }
//     },
// };

export const TEXT_FIELD_SX = {
    backgroundColor: '#FBF8F5',
    borderRadius: '18px',
    border: '1px solid rgba(12, 36, 28, 0.08)',
    boxShadow: '0 8px 22px rgba(0,0,0,.02)',
    width: '100%',
    transition: 'all 0.2s ease',

    '&:hover': {
        borderColor: 'rgba(130, 177, 148, 0.5)',
    },

    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    '& .MuiSelect-select': {
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '13px', 
        fontWeight: 700,
        color: '#13231d', 
        fontFamily: '"Sora", sans-serif',
        textAlign: 'left',
    },

    '& .MuiInputLabel-root': {
        fontSize: '12px',
        color: 'rgba(19, 35, 29, 0.48)',
        fontWeight: 600,
        fontFamily: '"Sora", sans-serif',
        transform: 'translate(14px, 14px) scale(1)',
        '&.Mui-focused, &.MuiInputLabel-shrink': {
            display: 'none',
        },
    },

    '& .Mui-disabled': {
        cursor: 'not-allowed',
        WebkitTextFillColor: 'rgba(19,35,29,.48))',
    }
};