import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { greenFiAxios } from '../../../api';
import { s2ab } from '@/utils';

export interface IPayload {
  endpoint?: string;
  sort_by?: string | null | undefined;
  type?: string
  userId?: string | null | undefined;
  roles?: any;
  country_id?: any;
  department_Ids?: any;
  filter?: any;
  fileName?: string;
  companyIds?: number[] | null; // Add companyIds as a top-level property
}

interface IExport {
  isLoading: boolean;
}

const initialState: IExport = {
  isLoading: false
};

export const exportFile = createAsyncThunk<void, IPayload, object>('exportCSV', async ({ endpoint, sort_by, type, userId, roles, country_id, department_Ids, filter, fileName }) => {
  const queryParams = new URLSearchParams();
  if (type) queryParams.append('export_type', type);
  if (sort_by) queryParams.append('sort_by', sort_by);
  if (userId) queryParams.append('userId', userId);
  if (roles) queryParams.append('roles', roles);
  if (country_id) queryParams.append('country_id', country_id);
  if (department_Ids) queryParams.append('department_Ids', department_Ids);
  if (filter?.countryIds) queryParams.append('countryIds', filter?.countryIds);
  if (filter?.industryIds) queryParams.append('industryIds', filter?.industryIds);
  if (filter?.companyIds) queryParams.append('companyIds', filter?.companyIds);
  if (filter?.frameworkIds) queryParams.append('frameworkIds', filter?.frameworkIds);
  if (filter?.institutionIds) queryParams.append('institutionIds', filter?.institutionIds);
  if (filter?.department_Ids) queryParams.append('departmentIds', filter?.department_Ids);
  if (filter?.questionBankIds) queryParams.append('questionBankIds', filter?.questionBankIds);
  if (filter?.include_answers) queryParams.append('include_answers', filter?.include_answers);

  const response = await greenFiAxios.get(
      `v2/${endpoint}/export/all?${queryParams}`,
      { responseType: 'blob' }
    );

    // 2. Read the blob as UTF-8 text (the Base64 payload)
    const base64String = (await response.data.text()).trim();

    // 3. Decode Base64 → binary string
    let binary = atob(base64String);

    // 4. Convert binary string to Uint8Array
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // 5. Wrap the bytes in a new Blob of the original content-type
    const fileBlob = new Blob([bytes], {
      type: response.headers['content-type'] || 'application/octet-stream'
    });

    // 6. Create a download link and click it
    const downloadUrl = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || `${endpoint}s.${type}`;
    document.body.appendChild(link);
    link.click();

    // 7. Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
});

const exportFileSlice = createSlice({
  name: 'export-file',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(exportFile.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(exportFile.fulfilled, state => {
      state.isLoading = false;
    });
    builder.addCase(exportFile.rejected, state => {
      state.isLoading = false;
    });
  }
});

export const exportFileActions = exportFileSlice.actions;
export default exportFileSlice.reducer;
