import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../..';

export const selectUser = (state: RootState) => state.user;

export const selectUserRole = createSelector([selectUser], userState => userState.role);
export const selectUserId = createSelector([selectUser], userState => userState.id);
export const selectUserCountryId = createSelector([selectUser], userState => userState.countryId);
export const selectUserCompanyId = createSelector([selectUser], userState => userState.companyId);
export const selectUserFullAccess = createSelector([selectUser], userState => userState.fullAccess);
export const selectUserReportingTo = createSelector([selectUser], userState => userState.toReporting);
export const selectUserReportingManager = createSelector([selectUser], userState => userState.reportingManager);
