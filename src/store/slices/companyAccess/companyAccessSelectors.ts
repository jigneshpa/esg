import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../..';
import { CompanyAccess } from './companyAccessSlice';

const selectCompanyAccessState = (state: RootState) => state.companyAccess;

export const selectCompanyAccessList = createSelector(
  [selectCompanyAccessState],
  (companyAccessState) => companyAccessState.companies
);

export const selectCompanyAccessLoading = createSelector(
  [selectCompanyAccessState],
  (companyAccessState) => companyAccessState.isLoading
);

export const selectCompanyAccessError = createSelector(
  [selectCompanyAccessState],
  (companyAccessState) => companyAccessState.error
);

export const selectCompanyAccessById = createSelector(
  [selectCompanyAccessList, (state: RootState, companyId: number) => companyId],
  (companies, companyId) => companies.find((company: CompanyAccess) => company.id === companyId)
);

export const selectCompanyAccessByParentId = createSelector(
  [selectCompanyAccessList, (state: RootState, parentId: number) => parentId],
  (companies, parentId) => companies.filter((company: CompanyAccess) => company.parentId === parentId)
); 