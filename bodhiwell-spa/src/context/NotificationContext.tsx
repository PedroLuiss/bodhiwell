
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { AlertProps } from '@mui/material/Alert';
import { AlertSnackbar } from '../components/ui/AlertSnackbar';

interface AlertState {
  open: boolean;
  message: string;
  severity: AlertProps['severity'];
  autoHideDuration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertProps['severity'], autoHideDuration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: 'success', 
    autoHideDuration: 6000,
  });

   const handleClose = useCallback(() => {
    setAlertState((prevState) => ({ ...prevState, open: false }));
  }, []); 

    const showNotification = useCallback(
    (
      message: string,
      severity: AlertProps['severity'] = 'success',
      autoHideDuration?: number
    ) => {
      setAlertState({
        open: true,
        message,
        severity,
        autoHideDuration,
      });
    },
    [] 
  );

  const contextValue = React.useMemo(() => ({
    showNotification,
  }), [showNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <AlertSnackbar
        open={alertState.open}
        message={alertState.message}
        severity={alertState.severity}
        autoHideDuration={alertState.autoHideDuration}
        onClose={handleClose}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};