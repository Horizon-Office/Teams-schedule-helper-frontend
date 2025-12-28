'use client';

import { configureStore } from '@reduxjs/toolkit';
import scheduleReducer from '@/components/schedule/scheduleSlice';

export const store = configureStore({
  reducer: {
    schedule: scheduleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Відключаємо перевірку серіалізації
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;