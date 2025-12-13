import { apiInstance } from '@/api/axiosApi';

interface CreateCheckoutSessionResponse {
  success: boolean;
  sessionId: string;
  url: string;
}

export const paymentService = {
  /**
   * Create Stripe checkout session for monthly subscription
   * Redirects user to Stripe checkout page
   */
  createCheckoutSession: async (): Promise<CreateCheckoutSessionResponse> => {
    try {
      const response = await apiInstance.post<CreateCheckoutSessionResponse>(
        '/api/payment/create-checkout-session'
      );
      return response.data;
    } catch (error: any) {
      // Handle specific errors
      if (error.response?.status === 401) {
        throw new Error('Please login to continue');
      }
      if (error.response?.status === 500) {
        throw new Error('Price ID not configured. Please contact support.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to create checkout session. Please try again.');
    }
  },
};
