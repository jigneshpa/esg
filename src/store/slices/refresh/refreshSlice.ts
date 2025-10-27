import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RefreshState {
  refetchQueries: {
    [key: string]: boolean
  };
}

interface SetRefetchQueryPayload {
  queryKey: string;
  value: boolean;
}
const initialState: RefreshState = {
  refetchQueries: {
    billsByAsset: false,
    billTypesByCountry: false,
    usersAll: false,
    assetsAll: false,
    companyAll: false,
    companyAccess: false,
    assetDetails: false,
    questionBankList: false,
    companyDisclosure: false
  }
};

export const refreshSlice = createSlice({
  name: 'refresh',
  initialState,
  reducers: {
    setRefetchQuery: (state, action: PayloadAction<SetRefetchQueryPayload>) => {
      const { queryKey, value } = action.payload;
      if (queryKey in state.refetchQueries) {
        state.refetchQueries[queryKey] = value;
      }
    },
    resetRefetchQueries: state => {
      Object.keys(state.refetchQueries).forEach(key => {
        state.refetchQueries[key] = false;
      });
    }
  }
});

export const { setRefetchQuery, resetRefetchQueries } = refreshSlice.actions;

export default refreshSlice.reducer;
