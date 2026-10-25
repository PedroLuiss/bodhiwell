import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getListProfessionals } from '../services/professionalService';
import { ProfessionalsItem } from '../types';
import placeholder from "../assets/images/Bd_Placeholder.png";

export function useProfessionals() {
  const { t } = useTranslation();
  const [professionals, setProfessionals] = useState<ProfessionalsItem[] | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchProfessionals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getListProfessionals();
      setProfessionals(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar profesionales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const featuredProfessionals = useMemo(() => {
    if (!professionals) return [];
    return professionals.map((prof: ProfessionalsItem) => ({
      uid: prof.uid,
      fullName: `${prof.first_name} ${prof.last_name}`,
      professionName: prof.main_specialty?.name || t('landing.professionalsList.specialtyNotDefined', 'Especialidad'),
      imageUrl: prof.image ? `${apiUrl}${prof.image}` : placeholder,
      hasMsp: prof.has_msp,
      dimensionName: prof.main_specialty?.dimension?.name,
    }));
  }, [professionals, t, apiUrl]);

  return { professionals, featuredProfessionals, loading, error, fetchProfessionals };
}