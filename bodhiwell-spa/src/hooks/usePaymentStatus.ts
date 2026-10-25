import { useState, useRef, useCallback, useEffect } from 'react';
import { PaymentStatus } from '../types/Booking/booking';
import { paymentService } from '../services/paymentService';

const FINAL_STATUSES: PaymentStatus[] = ['captured', 'approved', 'authorized', 'rejected', 'refunded', 'partially_refunded', 'canceled', 'failed','no_payment'];
const MAX_ATTEMPTS_ON_PENDING = 3;

export const usePaymentStatus = () => {
    const [status, setStatus] = useState<PaymentStatus | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const attemptsRef = useRef<number>(0);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsLoading(false);
    }, []);

    const startPolling = useCallback(async (bookingUid: string) => {
        setIsLoading(true);
        setError(null);
        setStatus('initiating');
        attemptsRef.current = 0;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        const checkStatus = async () => {

            try {
                const response = await paymentService.getPaymentStatus(bookingUid);
                setStatus(response.status);

                if (response.status === 'pending') {
                    attemptsRef.current += 1;
                }

                const isFinalStatus = FINAL_STATUSES.includes(response.status);

                if (isFinalStatus || attemptsRef.current >= MAX_ATTEMPTS_ON_PENDING) {
                    stopPolling();
                }

            } catch (err: any) {
                setError(err.message || 'Error al verificar el estado del pago.');
                setStatus('failed');
                stopPolling();
            }
        };

        await checkStatus();


        if (attemptsRef.current < MAX_ATTEMPTS_ON_PENDING && intervalRef.current === null) {
            intervalRef.current = setInterval(checkStatus, 3000);
        }

    }, [stopPolling]);

    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    return { status, isLoading, error, startPolling, stopPolling };
};