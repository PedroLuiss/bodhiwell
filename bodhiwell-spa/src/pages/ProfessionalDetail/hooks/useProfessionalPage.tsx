import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAuthContext } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { useProfessionalDetail } from '../../../hooks/useProfessionalDetail';
import { useAvailability } from '../../../hooks/useAvailability';
import { useBooking } from '../../../hooks/useBookings';

import { IBookingRequest, PatientInfoData } from '../../../types/Booking/booking';
import { localStorageHelper } from '../../../utils/localStorageHelper';
import { systemSettingsService } from '../../../services/systemSettingsService';
import { SystemSettings } from '../../../types';

export const useProfessionalPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { uid } = useParams<{ uid: string }>();
    const { logout } = useAuthContext();
    const { showNotification } = useNotification();

    const { professional, loading: loadingProfessional, error } = useProfessionalDetail(uid || "");
    const { availability, loading: loadingAvailability } = useAvailability(uid || '');
    const { createBooking } = useBooking();

    const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);

    const [isFavorite, setIsFavorite] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [currentBookingUid, setCurrentBookingUid] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await systemSettingsService.getSettings();
                setSystemSettings(settings);
            } catch (err) {
                console.error("Error loading system settings", err);
            }
        };
        fetchSettings();
    }, []);

    const handleToggleFavorite = () => setIsFavorite(prev => !prev);
    const handleBookingModalClose = () => setIsBookingModalOpen(false);
    const handleGoBack = () => navigate('/professionals');

    const handleConfirmBooking = async (patientInfo: PatientInfoData) => {
        const bookingInfo = localStorageHelper.getItem<IBookingRequest>('bookingDetails');

        try {
            const result = await createBooking({
                professional_user_uid: bookingInfo?.professional_user_uid ?? "",
                date_booking_start: bookingInfo?.date_booking_start ?? "",
                email: patientInfo.email,
                name: patientInfo.name,
                number: patientInfo.number,
                notes: bookingInfo?.notes,
                photo: patientInfo.photo,
                type: bookingInfo?.type,
                reserve_reason: patientInfo.reserveReason,
                quote_for_invited: patientInfo.quoteForInvited,
                consult_type: bookingInfo?.consult_type
            });

            if (result?.response) {
                localStorageHelper.setItem('booking', result.response);
                localStorageHelper.setItem('bookingUid', result.response.uid);
                setCurrentBookingUid(result.response.uid);
                setIsConfirmationModalOpen(true);
                handleBookingModalClose();
            }

            if (result?.error) {
                showNotification(result.error.message, 'error');
                if (result.error.code === 401) {
                    localStorageHelper.setItem<string>('redirectAfterLogin', window.location.pathname + window.location.search);
                    logout();
                }
            }
        } catch (err) {
            showNotification(t('landing.professionalsDetail.errorBooking'), 'error');
        }
    };

    return {
        professional,
        availability,
        loading: loadingProfessional || loadingAvailability,
        error,
        uid,
        isFavorite,
        isBookingModalOpen,
        isConfirmationModalOpen,
        currentBookingUid,
        t,
        systemSettings,
        setIsBookingModalOpen,
        setIsConfirmationModalOpen,
        handleToggleFavorite,
        handleBookingModalClose,
        handleGoBack,
        handleConfirmBooking
    };
};