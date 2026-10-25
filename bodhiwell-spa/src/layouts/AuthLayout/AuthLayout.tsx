import React from 'react';
import styles from './AuthLayout.module.scss';
import logo from '../../assets/images/Logo-bodhiwell.png';
import { useNavigate } from 'react-router-dom';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {

    const navigate = useNavigate();

    return (
        <div className={styles['auth-page']}>

            <header className={styles['auth-page__header']}>
                <img src={logo} alt="Bodhiwell" className={styles['auth-page__logo']}  onClick={() => navigate('/')}/>
            </header>

            <main className={styles['auth-page__container']}>
                {children}
            </main>
        </div>
    );
};