import { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';

interface Appointment {
  uid: string;
  professionalName: string;
  professionalUid: string;
  reservationTime: string;
  reason: string;
}

interface PatientDashboardData {
  appointments: {
    total: number;
    pendingToday: number;
    color: string;
  };
  upcomingBookings: Appointment[];
}

export const usePatientDashboard = () => {
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<{ data: PatientDashboardData }>('/api/dashboard/kpis-patient');
        setData(response.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Error al cargar los KPIs del dashboard de paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { data, loading, error };
};