import { useEffect, useState, useCallback } from "react";
import { getAvailability } from "../services/professionalService";
import { IAvailabilityByDate, UseAvailabilityResult } from "../types";


export function useAvailability(
  professionalId: string
): UseAvailabilityResult {
  const [availability, setAvailability] = useState<IAvailabilityByDate[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailability(professionalId);
      setAvailability(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar disponibilidad');
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    if (professionalId) {
      fetchAvailability();
    }
  }, [professionalId, fetchAvailability]);

  return {
    availability,
    loading,
    error,
    refetchAvailability: fetchAvailability
  };
}