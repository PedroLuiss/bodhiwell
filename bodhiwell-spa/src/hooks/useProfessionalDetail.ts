import { useState, useEffect, useCallback } from 'react';
import { getProfessionalByUid } from '../services/professionalService';
import { 
  ProfileData, 
  UseProfessionalDetailResult 
} from '../types/Profesionals/professional';

export function useProfessionalDetail(
  professionalUid: string | undefined
): UseProfessionalDetailResult {
  const [professional, setProfessional] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | [] | null>(null);

  const fetchProfessional = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (professionalUid){
        const data = await getProfessionalByUid(professionalUid);
        setProfessional(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al cargar profesional');
    } finally {
      setLoading(false);
    }
  }, [professionalUid]);

  useEffect(() => {
    if (professionalUid) {
      fetchProfessional();
    }
  }, [professionalUid, fetchProfessional]);

  return { professional, loading, error, refetch: fetchProfessional };
}