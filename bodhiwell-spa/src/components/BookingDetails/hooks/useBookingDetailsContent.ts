import { useState,  useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { formatBookingDateTime, formatDuration } from '../../../utils/formatDate';
import { useAuthContext } from '../../../context/AuthContext';
import { IBookingDetail } from '../../../types/Booking/booking';

interface UseBookingDetailsContentProps {
    bookingDetail: IBookingDetail;
    onAction?: (actionType: string) => void;
    onUpdateBooking?: (id: string, data: { notes: string }) => Promise<any>;
}

export const useBookingDetailsContent = ({ 
    bookingDetail, 
    onAction, 
    onUpdateBooking 
}: UseBookingDetailsContentProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthContext();

    const [isReasonExpanded, setIsReasonExpanded] = useState(false);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteContent, setNoteContent] = useState(bookingDetail.notes || '');

    const isProfessional = user?.type_account === 'professional';
    const isVirtual = bookingDetail.type === 'virtual';
    const CHAR_LIMIT = 300;

    const reasonText = bookingDetail.reserve_reason || '';
    const needsTruncation = reasonText.length > CHAR_LIMIT;
    const displayText = useMemo(() => 
        (needsTruncation && !isReasonExpanded) ? `${reasonText.substring(0, CHAR_LIMIT)}...` : reasonText
    , [needsTruncation, isReasonExpanded, reasonText]);

    const { date } = formatBookingDateTime(bookingDetail.date_start);
    const durationDisplay = formatDuration(bookingDetail.date_start, bookingDetail.date_end, t);
    const formattedTime = dayjs(bookingDetail.date_start).format('hh:mm A');

    const modalityLabel = isVirtual 
        ? t('appAdmin.BookingDetailsContent.virtual', 'Virtual') 
        : t('appAdmin.BookingDetailsContent.presential', 'Presencial');

    const toggleReasonExpansion = () => setIsReasonExpanded(prev => !prev);

    const handleSaveNote = async () => {
        if (onUpdateBooking && bookingDetail.uid) {
            await onUpdateBooking(bookingDetail.uid, { notes: noteContent });
            setIsEditingNote(false);
        }
    };

    const handleCancelEdit = () => {
        setNoteContent(bookingDetail.notes || '');
        setIsEditingNote(false);
    };

    const handleCreateMeetLink = (e: React.MouseEvent) => {
        e.preventDefault();
        window.open('https://meet.google.com/landing', '_blank');
    };

    const handleViewProfessionalProfile = () => {
        if (bookingDetail.professional_uid) navigate(`/professionals/${bookingDetail.professional_uid}`);
    };

    const handleViewPatientProfile = () => {
        if (bookingDetail.patient_uid) navigate(`/${bookingDetail.patient_uid}/patient-profile`);
    };

    const handleStatusAction = () => {
        if (onAction) onAction(bookingDetail.status);
    };

    const getPatientPlaceholderMessage = () => {
        if (isVirtual) {
            return t('appAdmin.BookingDetailsContent.waitingVirtualLink');
        }
        return t('appAdmin.BookingDetailsContent.waitingAddress');
    };

    const showProfessionalReminder = isProfessional && !bookingDetail.notes && bookingDetail.status === 'CONFIRMED';

    return {
        t,
        isProfessional,
        isVirtual,
        date,
        formattedTime,
        durationDisplay,
        modalityLabel,
        displayText,
        needsTruncation,
        isReasonExpanded,
        toggleReasonExpansion,
        isEditingNote,
        setIsEditingNote,
        noteContent,
        setNoteContent,
        handleSaveNote,
        handleCancelEdit,
        handleCreateMeetLink,
        handleViewProfessionalProfile,
        handleViewPatientProfile,
        handleStatusAction,
        getPatientPlaceholderMessage,
        showProfessionalReminder
    };
};