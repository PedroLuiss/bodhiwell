import { SxProps, Theme } from '@mui/material/styles';


export const getBadgeNotificationStyles = (isSidebarOpen: boolean): SxProps<Theme> => ({
    position: 'absolute',
    right: isSidebarOpen ? '10px' : '6px',
    top: '10px',
    '& .MuiBadge-badge': {
        fontSize: '11px',
        top: '4px',
        right: '4px',
        height: '20px',
        minWidth: '20px',
        padding: '0 3px',
    }
});
