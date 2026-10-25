import axiosInstance from './axiosInstance';
import { SystemSettings } from '../types';

export const systemSettingsService = {
    getSettings: async (): Promise<SystemSettings> => {
        try {
            const response = await axiosInstance.get('/api/system-settings');
            return response.data;
        } catch (error) {
            console.error('Error fetching system settings:', error);
            throw error;
        }
    }
};
