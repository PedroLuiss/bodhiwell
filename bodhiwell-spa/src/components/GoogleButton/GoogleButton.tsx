import React from 'react';
import styles from './GoogleButton.module.scss';

interface GoogleButtonProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ onClick, children, style }) => (
  <button className={styles['google-btn']} onClick={onClick} type="button" style={style}>
    <span className={styles['google-btn__icon']}>
      G
    </span>
    <span className={styles['google-btn__text']}>{children}</span>
  </button>
);

export default GoogleButton;
