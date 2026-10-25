import React from 'react';
import { Typography, Box } from '@mui/material';
import styles from './ThankYou.module.scss';

interface ThankYouProps {
  onReset: () => void;
}

export const ThankYou = ({ onReset }: ThankYouProps) => {
  return (
    <div className={styles['thankYou']}>
      <Typography variant="h4" gutterBottom className={styles['thankYou__title']}>
        ¡Gracias por tu cita!
      </Typography>
      <Typography className={styles['thankYou__message']}>
        Hemos recibido tu información y te hemos enviado un correo de confirmación.
      </Typography>
      <Box className={styles['thankYou__actions']}>
        <button type="button" className={styles['thankYou__button']} onClick={onReset}>
          Reservar otra cita
        </button>
      </Box>
    </div>
  );
};