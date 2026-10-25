import { useState, useEffect, useCallback } from 'react';
import { getProfessions, ProfessionItem } from '../services/professionsService';

export function useProfessions() {
  const [professions, setProfession] = useState<ProfessionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchProfessions = useCallback(async (): Promise<ProfessionItem[]> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const profs = await getProfessions();
      setProfession(profs);
      setSuccess(true);
      return profs;
    } catch (err: any) {
      
      const message = err?.message || 'Error al cargar profesiones';
      setError(message);
      setSuccess(false);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfessions();
  }, [fetchProfessions]);

  return {
    professions,
    loading,
    error,
    success,
    fetchProfessions,
  };
}