import axiosInstance from './axiosInstance';
import { Specialty } from '../types';

interface SpecialtyApiResponse {
    success: boolean;
    data: Specialty[];
    message?: string;
}

export const specialtiesService = {
  getSpecialties: async (): Promise<SpecialtyApiResponse> => {
    try {
      const response = await axiosInstance.get<Specialty[]>('/api/specialties');
      
      return {
        success: true,
        data: response.data,
        message: 'Especialidades cargadas correctamente',
      };
      
    } catch (error: any) {
      console.error('Error fetching specialties:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || error.message || 'Error al cargar las especialidades',
      };
    }
  },
};