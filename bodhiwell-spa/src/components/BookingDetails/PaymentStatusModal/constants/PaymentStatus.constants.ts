import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { SvgIconComponent } from '@mui/icons-material';

export type StatusUIConfig = {
    Icon: SvgIconComponent | null;
    color: string;
    titleKey: string;
    messageKey: string;
};

export const STATUS_MAP: Record<string, StatusUIConfig> = {
    initiating: { Icon: null, color: '#3b82f6', titleKey: 'appAdmin.PaymentStatusModal.verifyingPayment', messageKey: 'appAdmin.PaymentStatusModal.initiatingPaymentMessage' },
    pending: { Icon: HourglassEmptyIcon, color: '#3b82f6', titleKey: 'appAdmin.PaymentStatusModal.paymentPending', messageKey: 'appAdmin.PaymentStatusModal.paymentPendingMessage' },
    pending_provider: { Icon: HourglassEmptyIcon, color: '#3b82f6', titleKey: 'appAdmin.PaymentStatusModal.paymentPending', messageKey: 'appAdmin.PaymentStatusModal.paymentPendingMessage' },
    processing: { Icon: HourglassEmptyIcon, color: '#3b82f6', titleKey: 'appAdmin.PaymentStatusModal.paymentPending', messageKey: 'appAdmin.PaymentStatusModal.paymentPendingMessage' },
    paid: { Icon: CheckIcon, color: '#22c55e', titleKey: 'appAdmin.PaymentStatusModal.paymentSuccessful', messageKey: 'appAdmin.PaymentStatusModal.paymentSuccessfulMessage' },
    approved: { Icon: CheckIcon, color: '#22c55e', titleKey: 'appAdmin.PaymentStatusModal.paymentSuccessful', messageKey: 'appAdmin.PaymentStatusModal.paymentSuccessfulMessage' },
    captured: { Icon: CheckIcon, color: '#22c55e', titleKey: 'appAdmin.PaymentStatusModal.paymentSuccessful', messageKey: 'appAdmin.PaymentStatusModal.paymentSuccessfulMessage' },
    rejected: { Icon: ErrorOutlineIcon, color: '#ef4444', titleKey: 'appAdmin.PaymentStatusModal.paymentRejected', messageKey: 'appAdmin.PaymentStatusModal.paymentRejectedMessage' },
    failed: { Icon: ErrorOutlineIcon, color: '#ef4444', titleKey: 'appAdmin.PaymentStatusModal.paymentRejected', messageKey: 'appAdmin.PaymentStatusModal.paymentRejectedMessage' },
    cancelled: { Icon: CancelOutlinedIcon, color: '#f97316', titleKey: 'appAdmin.PaymentStatusModal.paymentCancelled', messageKey: 'appAdmin.PaymentStatusModal.paymentCancelledMessage' },
    canceled: { Icon: CancelOutlinedIcon, color: '#f97316', titleKey: 'appAdmin.PaymentStatusModal.paymentCancelled', messageKey: 'appAdmin.PaymentStatusModal.paymentCancelledMessage' },
    error: { Icon: HelpOutlineIcon, color: '#ef4444', titleKey: 'appAdmin.PaymentStatusModal.paymentError', messageKey: 'appAdmin.PaymentStatusModal.paymentErrorMessage' },
    default: { Icon: HelpOutlineIcon, color: '#64748b', titleKey: 'appAdmin.PaymentStatusModal.unknownStatus', messageKey: 'appAdmin.PaymentStatusModal.unknownStatusMessage' }
};