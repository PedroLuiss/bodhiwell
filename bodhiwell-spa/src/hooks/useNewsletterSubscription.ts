
import { useState, useCallback } from 'react';
import { newsletterService } from '../services/newsletterService';
import { UseNewsletterSubscriptionReturn, NewsletterSubscriptionData } from '../types';
import { useNotification } from '../context/NotificationContext';

export const useNewsletterSubscription = (): UseNewsletterSubscriptionReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const { showNotification } = useNotification();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const validateEmail = (emailToValidate: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(emailToValidate);
    };

    const subscribe = useCallback(async (data: NewsletterSubscriptionData): Promise<boolean> => {
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            const { name, email, interests } = data;

            if (!name || !email || !interests) {
                setError('Por favor, completa todos los campos.');
                return false;
            }

            if (!validateEmail(email)) {
                setError('Por favor, ingresa un correo electrónico válido.');
                return false;
            }

            const response = await newsletterService.subscribeToNewsletter(data);
            setSuccess(response.message);
            showNotification(response.message, 'success', 4000);
            return true;

        } catch (err: any) {
            const errorMessage = err.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.';
            setError(errorMessage);
            showNotification(errorMessage, 'error', 4000);
            return false;

        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    return { subscribe, isLoading, error, success };
};