import { AllNotificationsResponse, GetAllNotificationsParams, NotificationItem, NotificationServiceResponse, UnreadCountResponse } from "../types";
import { mapDtoToItemNotification } from "../utils";
import axiosInstance from "./axiosInstance";


export const notificationService = {
  
  /**
   * Registra el token del dispositivo para notificaciones push
   */
  registerDeviceToken: async (token: string, deviceType: string = 'web'): Promise<void> => {
    try {
      await axiosInstance.post('/api/notifications/device-token', {
        token,
        device_type: deviceType
      });
    } catch (error: any) {
      if (error.response?.data) throw error.response.data;
      throw error;
    }
  },
 
  /**
   * Obtiene las notificaciones recientes no leídas (para el dropdown)
   */
  getRecentNotifications: async (): Promise<NotificationItem[]> => {
    try {
      const response = await axiosInstance.get<AllNotificationsResponse>('/api/notifications', {
        params: { 
            page: 1, 
            limit: 5, 
            prioritize_unread: true 
        }
      });
      
      return response.data.data.map(mapDtoToItemNotification);

    } catch (err: any) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },


  /**
   * Obtiene todas las notificaciones paginadas y filtradas
   */
  getAllNotifications: async (params: GetAllNotificationsParams): Promise<NotificationServiceResponse> => {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.filterType && params.filterType !== 'all' && { type: params.filterType.toUpperCase() }),
        ...(params.searchTerm && { search: params.searchTerm }) 
      };

      const response = await axiosInstance.get<AllNotificationsResponse>('/api/notifications', { 
        params: queryParams 
      });

      const { data, meta } = response.data;

      return {
        notifications: data.map(mapDtoToItemNotification),
        total: meta.total,
        page: meta.page,
        limit: meta.limit,
        totalPages: meta.pages
      };

    } catch (err: any) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  /**
   * Marca una notificación como leída
   */
  markAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    try {
      await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
      return { success: true };
    } catch (err: any) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead: async (userRole?: string): Promise<{ success: boolean; message?: string; updated_count?: number }> => {
    try {
      const response = await axiosInstance.patch<{ message: string; updated_count: number }>('/api/notifications/read-all');
      
      return { 
          success: true, 
          message: response.data.message, 
          updated_count: response.data.updated_count 
      };

    } catch (err: any) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  /**
   * Obtiene la cantidad de notificaciones no leídas
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await axiosInstance.get<UnreadCountResponse>('/api/notifications/unread-count');
      return response.data.count;
    } catch (err: any) {
      console.warn('[API] Error fetching unread count', err);
      return 0;
    }
  },
};