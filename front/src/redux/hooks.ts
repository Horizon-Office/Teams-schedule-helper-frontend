'use client';

import { AppDispatch, RootState } from '@/store/store';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
// import type { RootState, AppDispatch } from '@/app/store/store';

// Використовуйте замість звичайних `useDispatch` та `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;