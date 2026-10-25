import React from 'react';
import styles from './BackButton.module.scss';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface BackButtonProps {
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => (
  <button className={styles['back-btn']} onClick={onClick} type="button" aria-label="Volver">
    <ArrowBackIcon />
  </button>
);

export default BackButton;
