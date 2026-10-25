import { useState, useEffect, useCallback } from 'react';
import { userStatusService } from '../services/userStatusService';
import { UserStatus, UserStatusApiResponse } from '../types';

export const useUserStatus = () => {  
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [dataUserStatus, setDataUserStatus] = useState<UserStatusApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userStatusService.getStatus();

      if (response.success && response.data) {
        setStatus(response.data.status);
        setDataUserStatus(response.data);
      } else {
        setError(response.message || 'Ocurrió un error desconocido al cargar el estado.');
      }
    } catch (err: any) {
      console.error('Error en el hook useUserStatus:', err);
      setError(err.message || 'No se pudo establecer conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, dataUserStatus, loading, error, fetchStatus };
};