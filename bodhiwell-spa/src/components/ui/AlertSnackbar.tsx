import * as React from 'react';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert, { AlertProps } from '@mui/material/Alert';

interface AlertSnackbarProps {
    open: boolean;
    message: string;
    onClose: () => void;
    severity?: AlertProps['severity'];
    autoHideDuration?: number;
    anchorOrigin?: { vertical: 'top' | 'bottom', horizontal: 'center' | 'left' | 'right' }
}

export const AlertSnackbar: React.FC<AlertSnackbarProps> = ({
    open,
    message,
    onClose,
    severity = 'success',
    autoHideDuration = 6000,
    anchorOrigin = { vertical: 'top', horizontal: 'right' }
}) => {
    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
            return;
        }
        onClose();
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={handleClose}
            anchorOrigin={anchorOrigin}
        >
            <Alert
                onClose={handleClose}
                severity={severity}
                variant="filled"
                sx={{ 
                    width: '100%',
                    backgroundColor: (theme) => {
                        switch(severity) {
                            case 'success': return '#82B194';
                            case 'error': return '#C95C5C';
                            case 'warning': return '#D6A640';
                            case 'info': return '#D6A640'; // Using gold for info as well if ever used
                            default: return undefined;
                        }
                    },
                    color: '#fff',
                    '& .MuiAlert-icon': {
                        color: '#fff'
                    }
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};