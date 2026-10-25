import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentService } from '../../../../services/paymentService';
import { IBookingDetail } from '../../../../types/Booking/booking';

export const useRedPagosAlert = (bookingDetail: IBookingDetail) => {
    const { t } = useTranslation();
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        const checkPaymentMethod = async () => {
            if (bookingDetail.status === 'PENDING_PROVIDER' && bookingDetail.uid) {
                setIsLoading(true);
                try {
                    const statusRes = await paymentService.getPaymentStatus(bookingDetail.uid);
                    if (statusRes && statusRes.paymentMethod === 'redpagos') {
                        setPaymentInfo(statusRes);
                    }
                } catch (error) {
                    console.error("Error fetching payment status:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        checkPaymentMethod();
    }, [bookingDetail.uid, bookingDetail.status]);

    const handleViewCodeClick = useCallback(() => {
        if (paymentInfo?.paymentUrl) {
            window.open(paymentInfo.paymentUrl, '_blank', 'noopener,noreferrer');
        }
    }, [paymentInfo?.paymentUrl]);

    const handleCopyCode = useCallback(() => {
        if (paymentInfo?.paymentCode) {
            navigator.clipboard.writeText(paymentInfo.paymentCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    }, [paymentInfo?.paymentCode]);

    return {
        paymentInfo,
        isLoading,
        isCopied,
        handleViewCodeClick,
        handleCopyCode,
        t
    };
};