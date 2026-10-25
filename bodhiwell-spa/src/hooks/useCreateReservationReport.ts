import { useState } from 'react';
import { IReservationReportData } from '../types';
import { reservationReportService } from '../services/reservationReportService';
import { AxiosError } from 'axios';
import { useNotification } from '../context/NotificationContext';
interface ApiError {
  message: string;
  code?: number;
}

export const useCreateReservationReport = () => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReport = async (data: IReservationReportData, bookingUid: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await reservationReportService.saveReservationReport(bookingUid, data);
      showNotification('Informe creado con éxito.', 'success');
      setError(null);
      setSuccess(true);
    } catch (err) {
      let errorMessage = 'Ocurrió un error inesperado. Revisa tu conexión.';

      if (err instanceof AxiosError && err.response) {
        const apiError = err.response.data as ApiError;
        errorMessage = apiError.message || 'Ocurrió un error al procesar la solicitud.';
      }

      showNotification(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createReport,
    loading,
    success,
    error,
  };
};


