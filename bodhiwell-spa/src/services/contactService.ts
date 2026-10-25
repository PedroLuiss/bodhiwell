import axiosInstance from './axiosInstance';
import { ContactRequest, ContactResponse } from '../types';

export const contactService = {
  sendContactMessage: async (data: ContactRequest): Promise<ContactResponse> => {
    try {
      const response = await axiosInstance.post<ContactResponse>('/api/contact', data);
      return response.data;
    } catch (error: any) {
      console.error('Error sending contact message:', error);
      throw error;
    }
  }
};