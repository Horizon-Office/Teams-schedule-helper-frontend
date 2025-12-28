'use client';

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ScheduleState, Team, Event } from './scheduleTypes';

const getInitialData = (): Record<string, string> => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('scheduleData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  }
  return {};
};

// Функція для безпечного отримання дати
const getInitialSemester = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('scheduleSemester');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          startDate: parsed.startDate || '2024-09-01',
          endDate: parsed.endDate || '2024-12-31'
        };
      } catch (error) {
        console.error('Error loading semester from localStorage:', error);
      }
    }
  }
  return {
    startDate: '2024-09-01',
    endDate: '2024-12-31'
  };
};

const initialState: ScheduleState = {
  data: getInitialData(),
  teams: [
    {
      id: 'team_1',
      name: '121-24-1',
      mail: '121_24_1@university.edu',
      description: 'Група 121-24-1',
      members: [],
      order: {
        id: 'order_1',
        name: 'Навчальний план 121-24-1',
        student_count: 30,
        department: 'Кафедра інформатики',
        teams: [],
        events: []
      },
      events: []
    },
    {
      id: 'team_2',
      name: '113-23-1',
      mail: '113_23_1@university.edu',
      description: 'Група 113-23-1',
      members: [],
      order: {
        id: 'order_2',
        name: 'Навчальний план 113-23-1',
        student_count: 25,
        department: 'Кафедра математики',
        teams: [],
        events: []
      },
      events: []
    },
    {
      id: 'team_3',
      name: '121-24-2',
      mail: '121_24_2@university.edu',
      description: 'Група 121-24-2',
      members: [],
      order: {
        id: 'order_3',
        name: 'Навчальний план 121-24-2',
        student_count: 28,
        department: 'Кафедра інформатики',
        teams: [],
        events: []
      },
      events: []
    }
  ],
  events: [],
  loading: false,
  error: null,
  lastUpdated: null,
  semester: getInitialSemester(),
  periodTimes: [
    { start: '08:30', end: '10:00' },
    { start: '10:20', end: '11:50' },
    { start: '12:10', end: '13:40' },
    { start: '14:00', end: '15:30' },
    { start: '15:50', end: '17:20' },
  ]
};

// Асинхронна дія для збереження
export const saveSchedule = createAsyncThunk(
  'schedule/save',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { schedule: ScheduleState };
      const { data, teams, semester, periodTimes } = state.schedule;
      
      // Імітація API запиту
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Тут буде реальний запит:
      // const response = await fetch('/api/schedule/save', {
      //   method: 'POST',
      //   body: JSON.stringify({ data, teams, semester, periodTimes }),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      
      // if (!response.ok) throw new Error('Network response was not ok');
      
      return { success: true, message: 'Schedule saved successfully' };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save schedule');
    }
  }
);

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setScheduleData: (state, action: PayloadAction<Record<string, string>>) => {
      state.data = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    updateCell: (state, action: PayloadAction<{ cellId: string; value: string }>) => {
      const { cellId, value } = action.payload;
      state.data[cellId] = value;
      state.lastUpdated = new Date().toISOString();
      
      // Автозбереження в localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('scheduleData', JSON.stringify(state.data));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
      }
    },
    
    addTeam: (state, action: PayloadAction<Team>) => {
      state.teams.push(action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    removeTeam: (state, action: PayloadAction<string>) => {
      const teamId = action.payload;
      state.teams = state.teams.filter(team => team.id !== teamId);
      
      // Видаляємо дані для видаленої групи
      const teamToRemove = state.teams.find(t => t.id === teamId);
      if (teamToRemove) {
        const teamName = teamToRemove.name;
        const newData = { ...state.data };
        Object.keys(newData).forEach(key => {
          if (key.endsWith(`-${teamName}`)) {
            delete newData[key];
          }
        });
        state.data = newData;
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    setSemesterDates: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.semester = action.payload;
      
      // Зберігаємо у localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('scheduleSemester', JSON.stringify(state.semester));
        } catch (error) {
          console.error('Error saving semester to localStorage:', error);
        }
      }
    },
    
    clearSchedule: (state) => {
      state.data = {};
      state.events = [];
      state.lastUpdated = null;
      state.error = null;
      state.semester = {
        startDate: '2024-09-01',
        endDate: '2024-12-31'
      };
      if (typeof window !== 'undefined') {
        localStorage.removeItem('scheduleData');
        localStorage.removeItem('scheduleSemester');
      }
    },
    
    initializeTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = action.payload;
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(saveSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSchedule.fulfilled, (state) => {
        state.loading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(saveSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to save schedule';
      });
  }
});

export const {
  setScheduleData,
  updateCell,
  addTeam,
  removeTeam,
  setSemesterDates,
  clearSchedule,
  initializeTeams
} = scheduleSlice.actions;

export default scheduleSlice.reducer;