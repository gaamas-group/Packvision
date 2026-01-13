import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DashboardStats {
  total_orders: number;
  total_recordings: number;
  total_returned: number;
}

interface AdminState {
  stats: DashboardStats | null;
  recordings: any[];
}

const initialState: AdminState = {
  stats: null,
  recordings: [],
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<DashboardStats>) => {
      state.stats = action.payload;
    },
    setRecordings: (state, action: PayloadAction<any[]>) => {
      state.recordings = action.payload;
    },
  },
});

export const { setStats, setRecordings } = adminSlice.actions;
export default adminSlice.reducer;
