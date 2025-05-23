import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.tsx';
import companyReducer from './slices/companySlice.tsx';
import topicReducer from './slices/topicSlice.tsx';
import domainReducer from './slices/domainSlice.tsx';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    company: companyReducer,
    topic: topicReducer,
    domain: domainReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 