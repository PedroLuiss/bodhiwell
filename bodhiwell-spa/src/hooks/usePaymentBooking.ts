import { useState, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import { paymentService } from '../services/paymentService';

export const usePaymentBooking = () => {
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();
    const [error, setError] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

    const initiatePayment = async (bookingUid: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await paymentService.processPayment(bookingUid);
            
            if (response.payment_url) {
                setPaymentUrl(response.payment_url);
            } else {
                setError("No se recibió una URL de pago válida.");
                showNotification("Error: Faltan cargar las disponibilidades.", "error");
            }

        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al procesar el pago.');
            showNotification(err.message || 'Ocurrió un error al procesar el pago.', "error");
        } finally {
            setLoading(false);
        }
    };

    const clearPaymentUrl = useCallback(() => {
        setPaymentUrl(null);
    }, []);

    return { initiatePayment, loading, error, paymentUrl, clearPaymentUrl };
};