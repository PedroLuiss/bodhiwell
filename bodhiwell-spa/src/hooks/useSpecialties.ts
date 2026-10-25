import { useState, useEffect, useCallback } from 'react';
import { Specialty } from '../types';
import { specialtiesService } from '../services/specialtiesService';

export const useSpecialties = () => {  
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await specialtiesService.getSpecialties();

      if (response.success && response.data) {
        setSpecialties(response.data);
      } else {
        setError(response.message || 'Ocurrió un error desconocido al cargar las especialidades.');
      }
    } catch (err: any) {
      console.error('Error en el hook useSpecialties:', err);
      setError(err.message || 'No se pudo establecer conexión para obtener las especialidades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

  return { specialties, loading, error, fetchSpecialties };
};