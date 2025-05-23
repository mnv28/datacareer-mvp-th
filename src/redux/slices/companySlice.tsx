import { apiInstance } from '@/api/axiosApi';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


interface Company {
  id: number;
  name: string;
}

interface CompanyState {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  companies: [],
  isLoading: false,
  error: null,
};

export const fetchCompanies = createAsyncThunk(
  'company/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
        const response = await apiInstance.get('/api/company/getallcompanies');
      return response.data.companies;
    } catch (error) {
      return rejectWithValue('Failed to fetch companies');
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default companySlice.reducer; 