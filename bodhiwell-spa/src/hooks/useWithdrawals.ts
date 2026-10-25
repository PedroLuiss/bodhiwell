import { useState, useEffect, useCallback } from 'react';
import { Withdrawal } from '../types/Withdrawal/withdrawal.type';
import { withdrawalService } from '../services/withdrawalService';

export const useWithdrawals = () => {  
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await withdrawalService.getWithdrawals();

      if (response.success && response.data) {
        setWithdrawals(response.data);
      } else {
        setError(response.message || 'Ocurrió un error desconocido al cargar los retiros.');
      }
    } catch (err: any) {
      console.error('Error en el hook useWithdrawals:', err);
      setError(err.message || 'No se pudo establecer conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  return { withdrawals, loading, error, fetchWithdrawals };
};
