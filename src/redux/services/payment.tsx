import { apiInstance } from '@/api/axiosApi';

interface CreateCheckoutSessionResponse {
  success: boolean;
  sessionId: string;
  url: string;
}

interface SubscriptionStatusResponse {
  success: boolean;
  subscription: {
    status: string | null;
    planType: string | null;
    startDate: string | null;
    // Backward/forward compatible fields from backend
    endDate?: string | null;
    renewsOn?: string | null;
    endsOn?: string | null;
    subscriptionId: string | null;
    isTrial?: boolean | null;
  };
}

export const paymentService = {
  /**
   * Create Stripe checkout session for monthly subscription
   * Redirects user to Stripe checkout page
   */
  createCheckoutSession: async (): Promise<CreateCheckoutSessionResponse> => {
    try {
      // Verify token exists before making request
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required. Please login to continue.');
      }

      // Make request - axios interceptor will automatically add Authorization header
      const response = await apiInstance.post<CreateCheckoutSessionResponse>(
        '/api/payment/create-checkout-session',
        {} // Empty body if backend doesn't require it
      );
      return response.data;
    } catch (error: any) {
      // Handle specific HTTP status codes
      if (error.response?.status === 401) {
        // Unauthorized - token missing or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      if (error.response?.status === 403) {
        // Forbidden - token valid but insufficient permissions
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || 'Access denied. You do not have permission to perform this action.';
        throw new Error(errorMessage);
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please contact support.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error('Failed to create checkout session. Please try again.');
    }
  },

  /**
   * Fetch subscription status + billing period (from Stripe/DB)
   */
  getSubscriptionStatus: async (): Promise<SubscriptionStatusResponse> => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required. Please login to continue.');
      }

      const response = await apiInstance.get<SubscriptionStatusResponse>(
        '/api/payment/subscription-status'
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message
          || error.response?.data?.error
          || 'Access denied. You do not have permission to perform this action.';
        throw new Error(errorMessage);
      }
      if (error.response?.status === 500) {
        throw new Error('Server error. Please contact support.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error('Failed to load subscription status. Please try again.');
    }
  },
};
