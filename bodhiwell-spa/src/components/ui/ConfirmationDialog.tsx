import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  styled, 
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'; 

type ConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode; 
  confirmText?: string;
  cancelText?: string;
};

const ConfirmButton = styled(Button)(() => ({
  backgroundColor: '#FF6B6B', 
  color: '#fff',
  borderRadius: '8px',
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#e65a5a', 
    boxShadow: 'none',
  },
}));

const CancelButton = styled(Button)(() => ({
  color: '#6c757d', 
  borderRadius: '8px',
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));


const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '16px', 
          padding: '1.5rem', 
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <WarningAmberRoundedIcon sx={{ fontSize: '3.5rem', color: '#F39C12' }} />
      </Box>

      <DialogTitle 
        id="confirmation-dialog-title"
        sx={{ 
          fontWeight: '700', 
          fontSize: '1.5rem',
          color: '#2d3748', 
          padding: '0 0 0.5rem 0',
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent sx={{ padding: '0 0 2rem 0' }}>
        <DialogContentText 
          id="confirmation-dialog-description"
          sx={{
            color: '#718096', 
            fontSize: '1rem',
            lineHeight: 1.6,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: '1rem', padding: '0' }}>
        <CancelButton onClick={onClose}>
          {cancelText}
        </CancelButton>
        <ConfirmButton onClick={onConfirm} autoFocus>
          {confirmText}
        </ConfirmButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;