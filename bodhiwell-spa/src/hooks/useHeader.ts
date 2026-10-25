import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export const useHeader = () => {
    const { user, logout } = useAuthContext();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true);

    const profileMenuRef = useRef<HTMLDivElement>(null);
    const languageMenuRef = useRef<HTMLDivElement>(null);
    const navMenuRef = useRef<HTMLElement>(null);

    const toggleMenu = () => setIsMenuOpen(prev => !prev);

    useEffect(() => {
        const handleScroll = () => {
            setIsAtTop(window.scrollY === 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
            if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
                setIsLanguageMenuOpen(false);
            }
            if (isMenuOpen && navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const closeAllMenus = () => {
        setIsProfileMenuOpen(false);
        setIsLanguageMenuOpen(false);
        setIsMenuOpen(false);
    };

    const handleLogout = () => {
        setIsProfileMenuOpen(false);
        logout();
        navigate('/');
    };

    const selectLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        setIsLanguageMenuOpen(false);
    };

    const handleScrollToSection = (sectionId: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        closeAllMenus();

        if (window.location.pathname !== '/' && window.location.pathname !== '/home') {
            navigate('/#' + sectionId);
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                const header = document.querySelector('header');
                const headerHeight = header ? (header as HTMLElement).offsetHeight : 0;
                const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: elementTop - headerHeight - 20, behavior: 'smooth' });
            }
        }
    };

    const handleNotificationClick = () => {
        navigate('/notifications');
        closeAllMenus();
    };

    return {
        user,
        t,
        i18n,
        isMenuOpen,
        setIsMenuOpen,
        isProfileMenuOpen,
        setIsProfileMenuOpen,
        isLanguageMenuOpen,
        setIsLanguageMenuOpen,
        isAtTop,
        profileMenuRef,
        languageMenuRef,
        navMenuRef,
        toggleMenu,
        closeAllMenus,
        handleLogout,
        selectLanguage,
        handleScrollToSection,
        handleNotificationClick
    };
};
