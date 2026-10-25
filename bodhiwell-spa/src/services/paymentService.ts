import axiosInstance from './axiosInstance';
import { IPaymentBookingResponse, IPaymentStatusResponse } from '../types/Booking/booking';
import { ApiListResponse, Payment, PaymentApiDTO, PaymentFilters } from '../types/Payment/Payment.type';

const mapApiToPayment = (dto: PaymentApiDTO): Payment => {
  return {
    uid: dto.paymentUid,
    amount: dto.amount, 
    status: dto.status,
    paymentDate: dto.createdAt,
    reservationInfo: {
      uid: dto.booking.uid,
      reservationDate: dto.booking.dateBookingStart,
      professionalName: dto.professionalName,
      patientName: dto.patientName,
    },
  };
};

export const paymentService = {

  /**
   * Obtiene la lista paginada de pagos.
   */
  getPayments: async (filters: PaymentFilters = {}): Promise<ApiListResponse<Payment[]>> => {

    const params = new URLSearchParams();
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus.toLocaleUpperCase());
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    try {
      const response = await axiosInstance.get<ApiListResponse<PaymentApiDTO[]>>(`/api/payments`, { params });
      
      const mappedData = response.data.data.map(mapApiToPayment);

      return {
        ...response.data,
        data: mappedData,
      };
    } catch (error: any) {
      console.error('Error al obtener la lista de pagos:', error);
      if (error.response?.data) throw error.response.data;
      throw error;
    }
  },

  /**
   * Consulta el estado del pago de una reserva.
   */
  getPaymentStatus: async (bookingUid: string): Promise<IPaymentStatusResponse> => {
    try {
        const res = await axiosInstance.get<IPaymentStatusResponse>(
            `/api/bookings/${bookingUid}/payment-status`
        );
        return res.data;
    } catch (err: any) {
        console.error('Error getting payment status:', err);
        if (err.response?.data) throw err.response.data;
        throw err;
    }
  },

  /**
   * Inicia el proceso de pago para una reserva.
   */
  processPayment: async (bookingUid: string): Promise<IPaymentBookingResponse> => {
    try {
      const res = await axiosInstance.post(
        `/api/bookings/${bookingUid}/payments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Idempotency-Key': `payment-${bookingUid}-${Date.now()}`
          }
        }
      );
      return res.data;

      // await new Promise(resolve => setTimeout(resolve, 500));
      // return {
      //   payment_url: `https://mi-pasarela-de-pago.com/session/${Math.random().toString(36).substring(7)}`
      // };
    } catch (err: any) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },
};