import { RootState } from '../..';
import { createSelector } from '@reduxjs/toolkit';

export const selectBillTypesByCountry = (state: RootState) => state.refresh.refetchQueries['billTypesByCountry'];

export const selectBillsByAsset = (state: RootState) => state.refresh.refetchQueries['billsByAsset'];

export const selectAssetsAll = (state: RootState) => state.refresh.refetchQueries['assetsAll'];

export const selectUsersAll = (state: RootState) => state.refresh.refetchQueries['usersAll'];

export const selectAssetDetails = (state: RootState) => state.refresh.refetchQueries['assetDetails'];

export const selectQuestionBankList = (state: RootState) => state.refresh.refetchQueries['questionBankList'];

export const selectCompanyAll = (state: RootState) => state.refresh.refetchQueries['companyAll'];

export const selectCompanyAccess = (state: RootState) => state.refresh.refetchQueries['companyAccess'];

export const selectCompanyDisclosure = (state: RootState) => state.refresh.refetchQueries['companyDisclosure'];
