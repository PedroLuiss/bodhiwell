import axiosInstance from './axiosInstance';
import {
    IBookingResponse,
    IBookingDetail,
    ICancelBookingResponse,
    IBookingUpdate,
    IBookingCrate
} from '../types/Booking/booking';
import { IConsultation } from '../types/Reservations/Reservations.type';
import { MODALITY_OPTIONS } from '../constants';



export const bookingService = {
    /**
     * Lista todas las reservas del usuario (paciente o profesional)
     */
    getBookings: async (): Promise<IConsultation[]> => {
        try {
            const res = await axiosInstance.get<IConsultation[]>('/api/bookings');
            return res.data;
        } catch (err: any) {
            if (err.response?.data) throw err.response.data;
            throw err;
        }
    },

    /**
     * Crea una nueva reserva
     */
    createBooking: async (
        payload: IBookingCrate
    ): Promise<IBookingResponse> => {
        const formData = new FormData();
        formData.append('professional_user_uid', payload.professional_user_uid);
        formData.append('date_booking_start', payload.date_booking_start);
        formData.append('email', payload.email);
        formData.append('name', payload.name);
        formData.append('number', payload.number);

        if (payload.notes) {
            formData.append('notes', payload.notes);
        }
        if (payload.reserve_reason) {
            formData.append('reserve_reason', payload.reserve_reason);
        }
        if (payload.type) {
            formData.append('type', MODALITY_OPTIONS.find(opt => opt.label === payload.consult_type || "")?.value ?? "");
        }
        if (payload.photo) {
            formData.append('patient_image', payload.photo);
        }

        try {
            const res = await axiosInstance.post<IBookingResponse>(
                '/api/bookings',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return res.data;
        } catch (err: any) {
            if (err.response?.data) throw err.response.data;
            throw err;
        }
    },

    /**
     * Obtiene detalle de una reserva por ID
     */
    getBookingById: async (id: string): Promise<IBookingDetail> => {
        try {
            const res = await axiosInstance.get<IBookingDetail>(`/api/bookings/${id}`);
            return res.data;
        } catch (err: any) {
            if (err.response?.data) throw err.response.data;
            throw err;
        }
    },

    /**
     * Actualiza campos de una reserva existente
     */
    updateBooking: async (
        uid: string,
        update: IBookingUpdate
    ): Promise<IBookingDetail> => {
        try {
            const res = await axiosInstance.patch<IBookingDetail>(
                `/api/bookings/${uid}`,
                update
            );
            return res.data;
        } catch (err: any) {
            if (err.response?.data) throw err.response.data;
            throw err;
        }
    },

    /**
     * Cancela una reserva por ID
     */
    cancelBooking: async (id: string): Promise<ICancelBookingResponse> => {
        try {
            const res = await axiosInstance.delete<ICancelBookingResponse>(
                `/bookings/${id}`
            );
            return res.data;
        } catch (err: any) {
            if (err.response?.data) throw err.response.data;
            throw err;
        }

    },


};