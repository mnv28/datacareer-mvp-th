import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiInstance } from '@/api/axiosApi';

interface Topic {
  id: number;
  name: string;
}

interface TopicState {
  topics: Topic[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TopicState = {
  topics: [],
  isLoading: false,
  error: null,
};

export const fetchTopics = createAsyncThunk(
  'topic/fetchTopics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiInstance.get('/api/topic/userGetAllTopic');
      return response.data.topic;
    } catch (error) {
      return rejectWithValue('Failed to fetch topics');
    }
  }
);

const topicSlice = createSlice({
  name: 'topic',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topics = action.payload;
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default topicSlice.reducer; 