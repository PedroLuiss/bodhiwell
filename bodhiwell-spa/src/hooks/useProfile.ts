import { useState, useCallback } from 'react';
import { getProfileMe, editProfile, editPatientProfile, updateProfessionalProfile as updateProfessionalService } from '../services/profileService';
import { ProfileData, ProfessionalUpdatePayload } from '../types';
import { UseProfileProps } from '../types/Profile/useProfile';
import { useAuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../context/NotificationContext';

/**
 * Hook sencillo para probar el endpoint POST /api/profile con multipart/form-data
 * No usa schemas ni tipos estrictos. Solo construye un FormData a partir de un objeto plano.
 * Permite pasar estructuras anidadas (ej: { details: { about: '...' } }) y las convierte a
 * notación con brackets (details[about]).
 */

export function useProfile(): UseProfileProps {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { setUser } = useAuthContext();

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  const getDataProfile = useCallback(async (): Promise<ProfileData> => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const profileData = await getProfileMe();
        setProfile({ profile: profileData }); 
        setSuccess(true);
        setUser(profileData);
        return { profile: profileData };
      } catch (error) {
        setError('Error al obtener datos del perfil');
        setSuccess(false);
        throw error;
      } finally {
        setLoading(false);
      }
  }, [setUser]);

  const updateProfile = useCallback(async (data: any) => {
    setLoading(true); 
    setError(null);
    setSuccess(false);

    try {
      const wrappedData = data.profile ? data : { profile: data };
      const response = await editProfile(wrappedData as ProfileData);
      setSuccess(true);
      
      await getDataProfile(); 
      
      return response;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Error al actualizar perfil';
      setError(message);
      showNotification(message, 'error', 3000);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [t, showNotification, getDataProfile]);

  const updatePatientProfile = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const wrappedData = data.profile ? data : { profile: data };
      const response = await editPatientProfile(wrappedData as ProfileData);
      setSuccess(true);
      
      await getDataProfile();
      
      return response;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Error al actualizar perfil';
      setError(message);
      showNotification(message, 'error', 3000);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [t, showNotification, getDataProfile]);

  const updateProfessionalProfile = useCallback(async (data: ProfessionalUpdatePayload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateProfessionalService(data);
      setSuccess(true);
      
      return response;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Error al actualizar perfil profesional';
      setError(message);
      showNotification(message, 'error', 3000);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [t, showNotification, getDataProfile]);

  return { profile, loading, error, success, updateProfile, updateProfessionalProfile, updatePatientProfile, reset, getDataProfile };
}

export default useProfile;