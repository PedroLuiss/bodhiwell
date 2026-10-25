import { useState, useEffect } from 'react';
import { IReservationReport } from '../types';
import { reservationReportService } from '../services/reservationReportService';

export const useReservationReportDetails = (uid: string | undefined) => {
  const [report, setReport] = useState<IReservationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setError('No se proporcionó un ID de informe válido.');
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      setLoading(true);
      try {
        const reportData = await reservationReportService.getReservationReportByUid(uid);
        setReport(reportData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Ocurrió un error al cargar el informe.');
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [uid]);

  return { report, loading, error };
};
