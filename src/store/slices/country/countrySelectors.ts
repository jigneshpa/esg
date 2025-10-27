import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../..';

const getRawCountries = (state: RootState) => state.country.countries;

export const selectCountryList = createSelector([getRawCountries], countries => {
  return countries.map(item => ({
    label: item.name,
    value: item.id
  }));
});
