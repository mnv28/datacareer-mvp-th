import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/auth';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  totalAttempted: number;
  progressSummary: Record<string, unknown> | null;
  status: string;
  paymentDone?: boolean;
  subscriptionStatus?: string;
  planType?: string;
  trialStart?: string | null;
  trialUsed?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  trialStatus?: 'paid' | 'trial-active' | 'trial-expired' | 'no-trial';
  trialDaysRemaining?: number | null;
}

// Initialize user from localStorage if available
const getInitialUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    // Silently fail if localStorage parsing fails
  }
  return null;
};

const getInitialTrialDaysRemaining = (): number | null => {
  try {
    const raw = localStorage.getItem('trialDaysRemaining');
    if (raw === null || raw === undefined || raw === '') return null;
    const val = JSON.parse(raw);
    return typeof val === 'number' ? val : null;
  } catch {
    return null;
  }
};

const getInitialStoredTrialStatus = (): AuthState['trialStatus'] | undefined => {
  const raw = localStorage.getItem('trialStatus');
  if (!raw) return undefined;
  const val = raw.toString();
  if (val === 'paid' || val === 'trial-active' || val === 'trial-expired' || val === 'no-trial') return val;
  return undefined;
};

// Derive trial status from user data
const getInitialTrialStatus = (user: User | null): 'paid' | 'trial-active' | 'trial-expired' | 'no-trial' | undefined => {
  if (!user) return undefined;
  
  if (user.paymentDone) {
    return 'paid';
  }
  
  if (!user.trialStart) {
    return 'no-trial';
  }
  
  const now = new Date();
  const trialStart = new Date(user.trialStart);
  const daysDifference = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDifference < 7) {
    return 'trial-active';
  } else {
    return 'trial-expired';
  }
};

const initialUser = getInitialUser();
const initialTrialDaysRemaining = getInitialTrialDaysRemaining();
const initialTrialStatus = getInitialStoredTrialStatus() || getInitialTrialStatus(initialUser);
const initialState: AuthState = {
  user: initialUser,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  trialStatus: initialTrialStatus,
  trialDaysRemaining: initialTrialDaysRemaining,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string; deviceId?: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      if (response.trialStatus) {
        localStorage.setItem('trialStatus', response.trialStatus);
      }
      localStorage.setItem('trialDaysRemaining', JSON.stringify(response.trialDaysRemaining ?? null));
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      if (response.trialStatus) {
        localStorage.setItem('trialStatus', response.trialStatus);
      }
      localStorage.setItem('trialDaysRemaining', JSON.stringify(response.trialDaysRemaining ?? null));
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.trialStatus = undefined;
      state.trialDaysRemaining = null;
      try {
        localStorage.removeItem('trialStatus');
        localStorage.removeItem('trialDaysRemaining');
      } catch {
        // ignore
      }
      authService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
    updateTrialStatus: (state, action) => {
      if (action.payload.trialStatus) {
        state.trialStatus = action.payload.trialStatus;
        try {
          localStorage.setItem('trialStatus', action.payload.trialStatus);
        } catch {
          // ignore
        }
      }
      if (action.payload.trialDaysRemaining !== undefined) {
        state.trialDaysRemaining = action.payload.trialDaysRemaining;
        try {
          localStorage.setItem('trialDaysRemaining', JSON.stringify(action.payload.trialDaysRemaining));
        } catch {
          // ignore
        }
      }
      if (action.payload.user) {
        state.user = action.payload.user;
        try {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        } catch {
          // ignore
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.trialStatus = action.payload.trialStatus;
        state.trialDaysRemaining = action.payload.trialDaysRemaining;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, updateTrialStatus } = authSlice.actions;
export default authSlice.reducer; 