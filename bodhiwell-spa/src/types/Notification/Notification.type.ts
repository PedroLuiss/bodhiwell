export type NotificationType = 'BOOKING' | 'PAYMENT' | 'SYSTEM' | 'REMINDER';

export const NOTIFICATION_FILTERS = {
  professional: ['all', 'BOOKING', 'PAYMENT', 'SYSTEM', 'REMINDER'],
  patient: ['all', 'SYSTEM', 'REMINDER']
};


export interface NotificationDataPayment {
  transaction_uid: string; 
}

export interface NotificationDataSystem {
  action?: string;
  type?: string;
}

export interface NotificationDataBooking {
  booking_uid: string;
}

export interface NotificationDataReminder {
  booking_uid: string;
}

export interface NotificationItem {
    id?: number;
    uid: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    unread: boolean;
    createdAt: string;
    data?: any;
}


export interface UnreadCountResponse {
  count: number;
}

export interface GetAllNotificationsParams {
  page?: number;
  limit?: number;
  filterType?: string;
  searchTerm?: string;
}

export interface NotificationApiDTO {
  id: number;
  uid: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: any;
  readAt: string | null; 
  createdAt: string;
}

export interface AllNotificationsResponse {
  data: NotificationApiDTO[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface NotificationServiceResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

