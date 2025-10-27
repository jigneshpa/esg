import { Country } from '@/types/store/api/country';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CountryState {
  countries: Country[];
}

const initialState: CountryState = {
  countries: []
};

const countrySlice = createSlice({
  name: 'country',
  initialState,
  reducers: {
    setCountries: (state, action: PayloadAction<Country[]>) => {
      state.countries = action.payload;
    },
    clearCountries: () => initialState
  }
});

export const { setCountries, clearCountries } = countrySlice.actions;
export default countrySlice.reducer;
