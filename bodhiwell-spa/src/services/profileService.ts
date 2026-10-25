import { isAxiosError } from 'axios';
import axiosInstance from './axiosInstance';
import { ProfileData, ProfileResponse, ProfessionalUpdatePayload } from '../types';

/**
 * Edita el perfil del usuario autenticado
 * @param {Object} profileData - Datos del perfil a actualizar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export interface GetProfileResponse {
  profile: ProfileData['profile'];
}

export const editProfile = async (profileData: ProfileData) => {
  try {
    const response = await axiosInstance.post('/api/profile', profileData.profile, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });

    return response.data;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'response' in error && (error as any).response.data) {
      throw (error as any).response.data;
    }
    throw error;
  }
};

/**
 * Actualiza el perfil de un profesional utilizando FormData para soportar archivos
 * @param {ProfessionalUpdatePayload} data - Datos del perfil del profesional
 * @returns {Promise<any>} Respuesta del servidor
 */
export const updateProfessionalProfile = async (data: ProfessionalUpdatePayload) => {
  try {
    const formData = new FormData();

    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    formData.append('type_account', 'professional');
    formData.append('dni', data.dni);
    if (data.msp_number) formData.append('msp_number', data.msp_number);

    if (data.details) {
      Object.entries(data.details).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if ((key === 'profile_video_url' || key === 'country') && value === '') return;
        
        if (value instanceof File) {
          formData.append(`details[${key}]`, value);
        } else {
          if (typeof value === 'boolean') {
            formData.append(`details[${key}]`, value ? '1' : '0');
          } else {
            formData.append(`details[${key}]`, String(value));
          }
        }
      });
    }

    if (data.studies && Array.isArray(data.studies)) {
      data.studies.forEach((study, index) => {
        Object.entries(study).forEach(([key, value]) => {
          if (value === undefined || value === null) return;

          if (key === 'url_certificate' && value instanceof File) {
            formData.append(`studies[${index}][${key}]`, value);
          } else if (key !== 'url_certificate' && key !== 'delete') {
            formData.append(`studies[${index}][${key}]`, String(value));
          } else if (key === 'delete') {
            formData.append(`studies[${index}][${key}]`, value ? '1' : '0');
          }
        });
      });
    }

    const response = await axiosInstance.post('/api/profile', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      },
    });

    return response.data;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'response' in error && (error as any).response.data) {
      throw (error as any).response.data;
    }
    throw error;
  }
};

export const editPatientProfile = async (profileData: ProfileData) => {
  try {

    const response = await axiosInstance.post('/api/profile/patient', profileData.profile, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });

    return response.data;
  } catch (error) {

    if (typeof error === 'object' && error !== null && 'response' in error && (error as any).response.data) {

      throw (error as any).response.data;
    }

    throw error;
  }
};

export const getProfileDetails = async (uid: string): Promise<ProfileData['profile']> => {
  try {
    const response = await axiosInstance.get<any>(`/profile/${uid}`);
    return response.data.profile;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data;
      let message = 'Error del servidor.';

      switch (status) {
        case 401:
          message = 'No estás autorizado para realizar esta acción.';
          break;
        case 403:
          message = 'No tienes permiso para ver este perfil.';
          break;
        case 404:
          message = 'El perfil solicitado no fue encontrado.';
          break;
        case 500:
          message = 'Ocurrió un error interno en el servidor. Por favor, intenta de nuevo más tarde.';
          break;
        default:
          message = data?.message || `Ocurrió un error (código: ${status}).`;
      }

      console.error(`Error ${status} al obtener el perfil:`, data);

      const customError = new Error(message);
      (customError as any).status = status;
      (customError as any).data = data;
      throw customError;
    } else {
      console.error('Error inesperado al obtener el perfil:', error);
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    }
  }
};

export const getProfileMe = async (): Promise<ProfileResponse> => {
  try {
    const response = await axiosInstance.get<ProfileResponse>(`/api/me`);
    const profile = response.data;

    if (!profile) {
      throw new Error('Respuesta vacía del servidor.');
    }

    return profile;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data;
      let message = 'Error del servidor.';

      switch (status) {
        case 401:
          message = 'No estás autorizado para realizar esta acción.';
          break;
        case 500:
          message = 'Ocurrió un error interno en el servidor. Por favor, intenta de nuevo más tarde.';
          break;
        default:
          message = data?.message || `Ocurrió un error (código: ${status}).`;
      }

      const customError = new Error(message);
      (customError as any).status = status;
      (customError as any).data = data;
      throw customError;
    } else {
      console.error('Error inesperado al obtener datos.');
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    }
  }
};
