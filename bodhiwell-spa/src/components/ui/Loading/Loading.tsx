import React from 'react';
import logo from '../../../assets/images/Logo-bodhiwell.png'; 
import styles from './Loading.module.scss';

interface LoadingProps {
  fullscreen?: boolean;
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  fullscreen = false, 
  text, 
  className 
}) => {
  const containerClasses = [
    styles.loadingContainer,
    fullscreen ? styles.fullscreen : styles.inline,
    className
  ].filter(Boolean).join(' '); 

  return (
    <div className={containerClasses}>
      <div className={styles.content}>
        <img src={logo} alt="Cargando..." className={styles.logo} />
        {text && <p className={styles.text}>{text}</p>}
      </div>
    </div>
  );
};

export default Loading;