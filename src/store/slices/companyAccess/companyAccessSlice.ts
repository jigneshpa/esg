import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CompanyAccess {
  id: number;
  name: string;
  userId?: number;
  parentId?: number;
  // Add other properties as needed based on your API response
}

interface CompanyAccessState {
  companies: CompanyAccess[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CompanyAccessState = {
  companies: [],
  isLoading: false,
  error: null
};

const companyAccessSlice = createSlice({
  name: 'companyAccess',
  initialState,
  reducers: {
    setCompanyAccess: (state, action: PayloadAction<CompanyAccess[]>) => {
      state.companies = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCompanyAccessLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCompanyAccessError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearCompanyAccess: (state) => {
      state.companies = [];
      state.isLoading = false;
      state.error = null;
    }
  }
});

export const { 
  setCompanyAccess, 
  setCompanyAccessLoading, 
  setCompanyAccessError, 
  clearCompanyAccess 
} = companyAccessSlice.actions;

export default companyAccessSlice.reducer; 