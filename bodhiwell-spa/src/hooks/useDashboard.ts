import { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';

interface DashboardKpis {
  income: {
    value: number;
    comparison: string;
    comparisonEn?: string;
    color: string;
    currency?: string;
  };
  appointments: {
    total: number;
    pendingToday: number;
    color: string;
  };
  occupation: {
    rate: number;
    details: {
      occupied: string;
      free: string;
    };
  };
  wallet: {
    balance: number;
    link: string;
    currency?: string;
  };
  upcomingBookings: Array<{
    uid: string;
    patientName: string;
    patientUid: string;
    reservationTime: string;
    reason: string;
  }>;
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardKpis = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<{ data: DashboardKpis }>('/api/dashboard/kpis');
        setData(response.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Error al cargar los KPIs del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardKpis();
  }, []);

  return { data, loading, error };
};