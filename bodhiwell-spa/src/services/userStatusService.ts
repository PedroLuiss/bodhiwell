import axiosInstance from './axiosInstance';
import { ApiResponse, UserStatusApiResponse } from '../types';

export const userStatusService = {
  getStatus: async (): Promise<ApiResponse<UserStatusApiResponse>> => {
    try {
      const response = await axiosInstance.get<UserStatusApiResponse>('/api/profile/status');
      
      return {
        success: true,
        data: response.data,
      };

    } catch (error: any) {
      console.error('Error fetching user status:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener el estado del usuario',
      };
    }
  },
};