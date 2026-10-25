export type StatusConfig = {
    badgeKey: string;
    messageKey: string;
    actionKey?: string;
    badgeClass: string;
};

export const PATIENT_STATUS_CONFIG: Record<string, StatusConfig> = {
    WAITING_PAYMENT: {
        badgeKey: 'bookingStatus.patient.waitingPayment.badge',
        messageKey: 'bookingStatus.patient.waitingPayment.message',
        actionKey: 'bookingStatus.patient.waitingPayment.action',
        badgeClass: 'waiting',
    },
    PENDING_PROVIDER: {
        badgeKey: 'bookingStatus.patient.pendingProvider.badge',
        messageKey: 'bookingStatus.patient.pendingProvider.message',
        actionKey: 'bookingStatus.patient.pendingProvider.action',
        badgeClass: 'processing',
    },
    PROCESSING: {
        badgeKey: 'bookingStatus.patient.processing.badge',
        messageKey: 'bookingStatus.patient.processing.message',
        actionKey: 'bookingStatus.patient.processing.action',
        badgeClass: 'processing',
    },
    CONFIRMED: {
        badgeKey: 'bookingStatus.patient.confirmed.badge',
        messageKey: 'bookingStatus.patient.confirmed.message',
        badgeClass: 'confirmed',
    },
    CANCELLED: {
        badgeKey: 'bookingStatus.patient.cancelled.badge',
        messageKey: 'bookingStatus.patient.cancelled.message',
        badgeClass: 'cancelled',
    },
    COMPLETED: {
        badgeKey: 'bookingStatus.patient.completed.badge',
        messageKey: 'bookingStatus.patient.completed.message',
        actionKey: 'bookingStatus.patient.completed.action',
        badgeClass: 'completed',
    },
};

export const PROFESSIONAL_STATUS_CONFIG: Record<string, StatusConfig> = {
    WAITING_PAYMENT: {
        badgeKey: 'bookingStatus.professional.waitingPayment.badge',
        messageKey: 'bookingStatus.professional.waitingPayment.message',
        badgeClass: 'waiting',
    },
    PENDING_PROVIDER: {
        badgeKey: 'bookingStatus.professional.pendingProvider.badge',
        messageKey: 'bookingStatus.professional.pendingProvider.message',
        badgeClass: 'processing',
    },
    PROCESSING: {
        badgeKey: 'bookingStatus.professional.processing.badge',
        messageKey: 'bookingStatus.professional.processing.message',
        badgeClass: 'processing',
    },
    CONFIRMED: {
        badgeKey: 'bookingStatus.professional.confirmed.badge',
        messageKey: 'bookingStatus.professional.confirmed.message',
        actionKey: 'bookingStatus.professional.confirmed.action',
        badgeClass: 'confirmed',
    },
    CANCELLED: {
        badgeKey: '',
        messageKey: '',
        badgeClass: 'cancelled',
    },
    COMPLETED: {
        badgeKey: 'bookingStatus.professional.completed.badge',
        messageKey: 'bookingStatus.professional.completed.message',
        actionKey: 'bookingStatus.professional.completed.action',
        badgeClass: 'completed',
    },
};