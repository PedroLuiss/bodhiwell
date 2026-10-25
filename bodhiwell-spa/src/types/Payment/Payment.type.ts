export interface PaymentApiDTO {
  paymentUid: string;
  amount: number; 
  status: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'REJECTED' | 'REFUNDED';
  createdAt: string; 
  booking: {
    uid: string;
    dateBookingStart: string;
    status: string;
  };
  professionalName: string | null;
  patientName: string | null;
}

export interface Payment {
  uid: string;
  amount: number; 
  status: PaymentApiDTO['status'];
  paymentDate: string;
  reservationInfo: {
    uid: string;
    reservationDate: string;
    professionalName: string | null;
    patientName: string | null;
  };
}

export interface ApiListResponse<T> {
  page: number;
  limit: number;
  data: T;
}

export interface PaymentFilters {
  paymentStatus?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  page?: number;
  limit?: number;
}