import { useState, useEffect } from 'react';
import { Consultation } from '../types/Consultations/Consultation.type';
import { consultationService } from '../services/consultationService';

export const usePatientConsultations = (uidPatient: string | undefined) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uidPatient) {
      setLoading(false);
      setConsultations([]);
      return;
    }

    const fetchPatientConsultations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await consultationService.getPatientConsultations(uidPatient);
        setConsultations(data);
      } catch (err: any) {
        setError(err.message || 'Ocurrió un error al cargar las consultas del paciente.');
        setConsultations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientConsultations();
  }, [uidPatient]);

  return { consultations, loading, error };
};