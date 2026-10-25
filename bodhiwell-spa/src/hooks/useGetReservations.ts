import { useState, useEffect } from 'react';
import { IConsultation } from '../types/Reservations/Reservations.type';
import { bookingService } from '../services/bookingService';

interface UseReservationsReturn {
  data: IConsultation[];
  loading: boolean;
  error: string | null;
}

export const useGetReservations = (): UseReservationsReturn => {
  const [data, setData] = useState<IConsultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true); 
        const reservationsData = await bookingService.getBookings();
        setData(reservationsData);
        setError(null); 
      } catch (err: any) {
        console.error("Hook: Error al obtener datos.", err);
        setError(err.message || 'Ocurrió un error inesperado al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []); 

  return { data, loading, error };
};