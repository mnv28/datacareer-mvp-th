import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiInstance } from '@/api/axiosApi';

interface Domain {
  id: number;
  name: string;
}

interface DomainState {
  domains: Domain[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DomainState = {
  domains: [],
  isLoading: false,
  error: null,
};

export const fetchDomains = createAsyncThunk(
  'domain/fetchDomains',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiInstance.get('/api/domain/getAll');
      return response.data.domains;
    } catch (error) {
      return rejectWithValue('Failed to fetch domains');
    }
  }
);

const domainSlice = createSlice({
  name: 'domain',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDomains.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDomains.fulfilled, (state, action) => {
        state.isLoading = false;
        state.domains = action.payload;
      })
      .addCase(fetchDomains.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default domainSlice.reducer; 