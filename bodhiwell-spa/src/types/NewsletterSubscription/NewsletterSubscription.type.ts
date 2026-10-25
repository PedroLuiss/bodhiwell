export interface NewsletterSubscriptionData {
  name: string;
  email: string;
  interests: string;
}

export interface NewsletterApiResponse {
  message: string;
  uid: string;
}

export interface UseNewsletterSubscriptionReturn {
  subscribe: (data: NewsletterSubscriptionData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}