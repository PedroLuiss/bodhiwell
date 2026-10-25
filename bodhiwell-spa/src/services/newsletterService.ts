import axiosInstance from "./axiosInstance";
import { NewsletterSubscriptionData, NewsletterApiResponse } from "../types";

export const newsletterService = {
    subscribeToNewsletter: async (data: NewsletterSubscriptionData): Promise<NewsletterApiResponse> => {
        try {
            const response = await axiosInstance.post<NewsletterApiResponse>('/api/newsletter', data);
            return response.data;
        } catch (error: any) {
            if (error.response?.data) throw error.response.data;
            throw error;
        }
    }
};