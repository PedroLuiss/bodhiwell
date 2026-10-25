
import axiosInstance from './axiosInstance';
import { IApiAvailabilityItem, IAvailabilityResponse, IAvailabilitySavePayload } from '../types';

export const availabilityService = {

  getAvailability: async (): Promise<IApiAvailabilityItem[]> => {
    try {
      const response = await axiosInstance.get<IAvailabilityResponse>('api/profile/my-availabilities');
      const { data } = response.data
      return data;
    } catch (err: any) {
      console.error('Error al obtener la disponibilidad:', err);
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },


  saveAvailability: async (payload: IAvailabilitySavePayload): Promise<IAvailabilityResponse> => {
    try {
      const response = await axiosInstance.post<IAvailabilityResponse>('/api/profile/my-availabilities', payload);
      const { data } = response.data
      return { data };
    } catch (err: any) {
      console.error('Error al guardar la disponibilidad:', err);
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  }
};