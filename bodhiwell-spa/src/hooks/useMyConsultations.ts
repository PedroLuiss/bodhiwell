import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Consultation } from '../types/Consultations/Consultation.type';
import { consultationService } from '../services/consultationService';

export const useMyConsultations = () => {
    const { t } = useTranslation();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyConsultations = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await consultationService.getMyConsultations();
        setConsultations(data);
      } catch (err: any) {
        setError(err.message || t('appAdmin.consultationsList.errorText'));
        setConsultations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyConsultations();
  }, [t]);

  return { consultations, loading, error };
};