import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/es';   
import 'dayjs/locale/en'; 

export const useUserLocale = () => {
    const { i18n } = useTranslation();
    
    const currentLocale = i18n.language.startsWith('en') ? 'en' : 'es';

    useEffect(() => {
        dayjs.locale(currentLocale);
    }, [currentLocale]);

    return currentLocale; 
};