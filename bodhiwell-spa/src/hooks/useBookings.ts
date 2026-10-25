import { useState, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import { IBookingCrate, IBookingDetail, IBookingResponse, IBookingUpdate, ICancelBookingResponse } from '../types/Booking/booking';
import { IAvailability, IConsultation } from '../types';

export function useBooking() {
  // — Listado
  const [bookings, setBookings] = useState<IConsultation[] | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const refetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const data = await bookingService.getBookings();
      setBookings(data);
    } catch (err: any) {
      setBookingsError(err?.message || 'Error al cargar reservas');
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  // — Detalle
  const [bookingDetail, setBookingDetail] = useState<IBookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchBookingDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await bookingService.getBookingById(id);
      setBookingDetail(data);
    } catch (err: any) {
      setDetailError(err?.message || 'Error al obtener detalle');
    } finally {
      setDetailLoading(false);
    }
  }, []);


  // — Disponibilidad
  const [availability] = useState<IAvailability[] | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async (professionalId: string) => {
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    try {
        // const data = await bookingService.getBookingById(professionalId);
        // setAvailability(data);
    } catch (err: any) {
      setAvailabilityError(err?.message || 'Error al cargar disponibilidad');
    } finally {
      setAvailabilityLoading(false);
    }
  }, []);


  // — Crear reserva
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const createBooking = useCallback(
    async (payload: IBookingCrate): Promise<{ response: IBookingResponse | null; error: {code:number, message:string} | null }> => {
      setCreateLoading(true);
      setCreateError(null);

      try {
        const res = await bookingService.createBooking(payload);
        return { response: res, error: null };
      } catch (err: any) {
        const errorMessage = err?.message || 'Error al crear reserva';
        setCreateError(errorMessage);
        return { response: null, error: err };
      } finally {
        setCreateLoading(false);
      }
    },
    []
  );


  // — Actualizar reserva
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateBooking = useCallback(
    async (id: string, data: IBookingUpdate): Promise<IBookingDetail | null> => {
      setUpdateLoading(true);
      setUpdateError(null);
      try {
        const res = await bookingService.updateBooking(id, data);
        await fetchBookingDetail(id);
        return res;
      } catch (err: any) {
        setUpdateError(err?.message || 'Error al actualizar reserva');
        return null;
      } finally {
        setUpdateLoading(false);
      }
    },
    [fetchBookingDetail]
  );


  // — Cancelar reserva
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const cancelBooking = useCallback(
    async (id: string): Promise<ICancelBookingResponse | null> => {
      setCancelLoading(true);
      setCancelError(null);
      try {
        const res = await bookingService.cancelBooking(id);
        // Actualizar listado y detalle
        await refetchBookings();
        if (bookingDetail?.uid === id) await fetchBookingDetail(id);
        return res;
      } catch (err: any) {
        setCancelError(err?.message || 'Error al cancelar reserva');
        return null;
      } finally {
        setCancelLoading(false);
      }
    },
    [refetchBookings, bookingDetail, fetchBookingDetail]
  );


  // — Resultado del hook
  return {
    bookings,
    bookingsLoading,
    bookingsError,
    refetchBookings,

    bookingDetail,
    detailLoading,
    detailError,
    fetchBookingDetail,

    availability,
    availabilityLoading,
    availabilityError,
    fetchAvailability,

    createBooking,
    createLoading,
    createError,

    updateBooking,
    updateLoading,
    updateError,

    cancelBooking,
    cancelLoading,
    cancelError
  };
}