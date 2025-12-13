import { apiInstance } from '@/api/axiosApi';

interface LoginCredentials {
  email: string;
  password: string;
  deviceId?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token: string;
  trialStatus?: 'paid' | 'trial-active' | 'trial-expired' | 'no-trial';
  trialDaysRemaining?: number | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    lastLogin: string;
    totalAttempted: number;
    progressSummary: Record<string, unknown> | null;
    status: string;
    paymentDone?: boolean;
    trialStart?: string | null;
    trialUsed?: boolean;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiInstance.post<any>('/api/auth/login', credentials);
      const data = response.data;
      
      // Map backend response fields to frontend expected fields
      return {
        message: data.message || 'Login successful',
        token: data.token,
        trialStatus: data.trialStatus || data.status, // Map 'status' to 'trialStatus'
        trialDaysRemaining: data.trialDaysRemaining !== undefined 
          ? data.trialDaysRemaining 
          : data.remainingDays, // Map 'remainingDays' to 'trialDaysRemaining'
        user: data.user,
      };
    } catch (error: any) {
      // Handle trial-expired and no-trial errors - backend might return 403 but we still want to allow login
      // The ProtectedRoute will handle blocking access
      if (error.response?.status === 403) {
        const errorType = error.response?.data?.error || error.response?.data?.trialStatus;
        if (errorType === 'trial-expired' || errorType === 'no-trial') {
          // If backend returns token in error response, use it
          if (error.response?.data?.token) {
            return {
              message: error.response.data.message || 'Login successful',
              token: error.response.data.token,
              trialStatus: errorType,
              trialDaysRemaining: null,
              user: error.response.data.user || {
                id: 0,
                name: '',
                email: credentials.email,
                role: 'user',
                lastLogin: new Date().toISOString(),
                totalAttempted: 0,
                progressSummary: null,
                status: 'active',
                paymentDone: false,
              },
            };
          }
        }
      }
      
      // Extract error message from backend response
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await apiInstance.post<AuthResponse>('/api/auth/signup', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
