import axios from 'axios';

import { GREENFI_STORAGE_KEY, URLS } from '@/constants';

export const greenFiAxios = axios.create({
  baseURL: import.meta.env.VITE_GREENFI_API
});

greenFiAxios.interceptors.request.use(
  config => {
    const tokens = sessionStorage.getItem(GREENFI_STORAGE_KEY) || localStorage.getItem(GREENFI_STORAGE_KEY);
    if (tokens) {
      const accessToken = JSON.parse(tokens).accessToken;
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => {
    Promise.reject(error);
  }
);

greenFiAxios.interceptors.response.use(
  config => {
    return config;
  },
  error => {
    if ([403].includes(error?.response?.status)) {
      // Only clear specific auth-related items, not everything
      sessionStorage.removeItem(GREENFI_STORAGE_KEY);
      localStorage.removeItem(GREENFI_STORAGE_KEY);

      // Don't clear everything as it might interfere with Redux persist
      // sessionStorage.clear();
      // localStorage.clear();

      // Don't use window.location as it causes full page reload
      // Let the WithAuth component handle the redirect
      console.log('Axios interceptor: Auth error, tokens cleared');
    }
    return Promise.reject(error);
  }
);

const getListUser = async (params: any) => {
  const res = await greenFiAxios.get('users', {
    params: { page: 1, max_results: 10, ...params }
  });
  return res?.data?.data;
};

export const exportAssetManagement = async () => {
  const res = await greenFiAxios.get('v2/asset/export/all?', {
    headers: {
      accept: 'application/octet-stream'
    }
  });
  return res;
};

const getUserInfo = async () => {
  const res = await greenFiAxios.get('user');
  return res?.data?.data;
};

const patchUserInfo = async (data: any, userId: any) => {
  const res = await greenFiAxios.patch(`v2/user/${userId}`, data);
  return res?.data?.data;
};

const createBill = async (billData: any) => {
  const response = await greenFiAxios.post('v2/bill', billData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000
  });
  return response.data;
};

export const uploadFileApi = async (formData: any, companyId: any): Promise<any> => {
  const res = await greenFiAxios.post<any>(`/upload?company_id=${companyId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

const getCompany = async (params: any) => {
  const res = await greenFiAxios.get('company', {
    params: { page: 1, max_results: 10, ...params }
  });
  return res?.data?.data;
};

const createCompany = async (data: any) => {
  const res = await greenFiAxios.post('company', data, {
    headers: {
      'content-type': 'multipart/form-data'
    }
  });
  return res?.data?.data;
};

const editCompany = async (companyId: any, data: any) => {
  const res = await greenFiAxios.patch(`company/${companyId}`, data, {
    headers: {
      'content-type': 'multipart/form-data'
    }
  });
  return res?.data?.data;
};

const deleteCompany = async (companyId: any) => {
  const res = await greenFiAxios.delete(`company/${companyId}`);
  return res;
};

const getCompanyDetail = async (companyId: any) => {
  const res = await greenFiAxios.get(`company/${companyId}`);
  return res?.data?.data;
};

const uploadCompany = async (data: any) => {
  const res = await greenFiAxios.post('company/upload', data, {
    headers: {
      'content-type': 'multipart/form-data'
    }
  });
  return res?.data?.data;
};

const getUploadProcessStatus = async (uploadProcessId: any) => {
  const res = await greenFiAxios.get(`upload-process/${uploadProcessId}`);
  return res?.data?.data;
};

const getCountry = async () => {
  const res = await greenFiAxios.get('country');
  return res?.data?.data;
};

const getCountryFilter = async (params: any) => {
  const res = await greenFiAxios.get('country-filter', {
    params
  });
  return res?.data?.data;
};

const getCountryFilterDashboard = async (params: any) => {
  const res = await greenFiAxios.get('country-filter-dashboard', {
    params
  });
  return res?.data?.data;
};

const getIndustryFilter = async (params: any) => {
  const res = await greenFiAxios.get('industry-filter', {
    params
  });
  return res?.data?.data;
};

const getAsset = async (companyId: any, params: any) => {
  const res = await greenFiAxios.get(`company/${companyId}/asset`, {
    params: { page: 1, max_results: 10, ...params }
  });
  return res?.data?.data;
};

const getAssetMap = async (companyId: any) => {
  const res = await greenFiAxios.get(`company/${companyId}/asset-map`);
  return res?.data?.data;
};

const getQuestionnaire = async (companyId: any, categoryId: any, year: any) => {
  const res = await greenFiAxios.get(`company/${companyId}/questionnaire`, {
    params: { categoryId, year }
  });
  return res?.data.data;
};

const getEditQuestionnaire = async (categoryId: any, year: any) => {
  const res = await greenFiAxios.get(`questionnaire-detail`, {
    params: { categoryId, year }
  });
  return res?.data.data;
};

const updateEditQuestionnaire = async (categoryId: any, year: any, questions: any) => {
  const res = await greenFiAxios.patch(`questionnaire/category/${categoryId}/year/${year}`, {
    questions
  });
  return res?.data.data;
};

const deleteEditQuestionnaire = async (questionnaireId: any, questionIds: any) => {
  const res = await greenFiAxios.delete(`questionnaire/${questionnaireId}/question`, {
    data: { questionIds }
  });
  return res?.data.data;
};

const uploadQuestionnaire = async (data: any, categoryId: any, year: any) => {
  const res = await greenFiAxios.post(`questionnaire/category/${categoryId}/year/${year}/upload`, data, {
    headers: {
      'content-type': 'multipart/form-data'
    }
  });
  return res;
};

const submitAnswer = async (companyId: any, questionnaireId: any, data: any) => {
  const res = await greenFiAxios.post(`company/${companyId}/questionnaire/${questionnaireId}/answer`, data);
  return res?.data?.data;
};

const createAsset = async (data: any) => {
  const res = await greenFiAxios.post('asset', data);
  return res?.data?.data;
};

const createAssetMap = async (data: any) => {
  const res = await greenFiAxios.post('asset-map', data);
  return res?.data?.data;
};

const deleteAssetMap = async (data: any) => {
  const res = await greenFiAxios.delete('asset', {
    data: { assetId: data }
  });
  return res?.data?.data;
};

const exportQuestionnaire = async (companyId: any, data: any) => {
  const res = await greenFiAxios.post(`company/${companyId}/questionnaire/export`, data);
  return res?.data?.data;
};

const getUserList = async (params: any) => {
  const res = await greenFiAxios.get('users', {
    params: { page: 1, max_results: 10, ...params }
  });
  return res?.data?.data;
};

const createUser = async (data: any) => {
  const res = await greenFiAxios.post('user', data);
  return res?.data?.data;
};

const uploadUser = async (data: any) => {
  const res = await greenFiAxios.post('user/upload', data, {
    headers: {
      'content-type': 'multipart/form-data'
    }
  });
  return res?.data?.data;
};

const exportUser = async ({ search, country_id }: any) => {
  const res = await greenFiAxios.get('user/export', {
    params: { search, country_id },
    headers: {
      accept: 'application/octet-stream'
    }
  });
  return res;
};

const updateUserStatus = async (userId: any, status: any) => {
  const res = await greenFiAxios.patch(`user/${userId}/active`, {
    status
  });
  return res?.data;
};

const updateUserRole = async (userId: any, role: any) => {
  const res = await greenFiAxios.patch(`user/${userId}/set-role`, {
    role
  });
  return res;
};

const deleteUser = async (userId: any) => {
  const res = await greenFiAxios.delete(`user/${userId}`);
  return res;
};

const getStatistics = async (params?: any) => {
  const res = await greenFiAxios.get('v2/dashboard/statistics', { params });
  return res?.data?.data;
};

const getUserGrowth = async (data: any, params: any) => {
  const res = await greenFiAxios.post('dashboard/user-growth', data, {
    params
  });
  return res?.data?.data;
};

const getQuestionnaireApproval = async (params: any) => {
  const res = await greenFiAxios.get('user-questionnaire', {
    params: { page: 1, max_results: 10, ...params }
  });
  return res?.data?.data;
};

const getQuestionnaireReview = async (companyId: any, questionnaireId: any, userId: any) => {
  const res = await greenFiAxios.get(
    `company/${companyId}/questionnaire/${questionnaireId}/user/${userId}/user-questionnaire`
  );
  return res?.data?.data;
};

const sendQuestionnaireReviewStatus = async (questionnaireId: any, userId: any, companyId: any, data: any) => {
  const res = await greenFiAxios.post(
    `questionnaire/${questionnaireId}/user/${userId}/company/${companyId}/questionnaire-approval`,
    data
  );
  return res?.data?.data;
};

const getIndustry = async () => {
  const res = await greenFiAxios.get('industry');
  return res?.data?.data;
};

const getQuestionnaireCategory = async () => {
  const res = await greenFiAxios.get('questionnaire-category');
  return res?.data?.data;
};

const getQuestionnaireYear = async () => {
  const res = await greenFiAxios.get('questionnaire-year');
  return res?.data?.data;
};

const getQuestionnaireCategoryUpload = async (year: any) => {
  const res = await greenFiAxios.get('questionnaire-category/upload', {
    params: { year }
  });
  return res?.data?.data;
};

const getQuestionnaireYearUpload = async (categoryId: any) => {
  const res = await greenFiAxios.get('questionnaire-year/upload', {
    params: { categoryId }
  });
  return res?.data?.data;
};

const markFlag = async (data: any) => {
  const res = await greenFiAxios.patch('user-questionnaire/flag', {
    userQuestionnaireIds: data
  });
  return res?.data?.data;
};

const sendSupport = async (data: any) => {
  const res = await greenFiAxios.post('support-form', data);
  return res?.data?.data;
};

const sendDeviceToken = async (data: any) => {
  const res = await greenFiAxios.post('device-token', data);
  return res?.data?.data;
};

const uploadFile = async (formData: any) => {
  const res = await greenFiAxios.post('media', formData);
  return res?.data?.data;
};

const getQuestionnaireCategoryStatus = async (params: any) => {
  const res = await greenFiAxios.get('questionnaire-category-status', {
    params
  });
  return res?.data?.data;
};

const deleteDeviceToken = async (data: any) => {
  const res = await greenFiAxios.delete(`device-token/${data}`);
  return res?.data?.data;
};

const getNotifications = async (params: any) => {
  const res = await greenFiAxios.get('notification', {
    params: { page: 1, max_results: 10, ...params }
  });
  return res?.data?.data;
};

const getNotificationDetail = async (notificationId: any) => {
  const res = await greenFiAxios.get(`notification/${notificationId}`);
  return res?.data?.data;
};

const getTotalNotificationUnread = async () => {
  const res = await greenFiAxios.get('notification/unread');
  return res?.data?.data;
};

const sendNotification = async (data: any) => {
  const res = await greenFiAxios.post('notification/system', data);
  return res?.data?.data;
};

const exportDashboardReport = async (params: any) => {
  const res = await greenFiAxios.get('dashboard/export', {
    params,
    headers: {
      accept: 'application/octet-stream'
    }
  });
  return res?.data;
};

const createCategory = async (data: any) => {
  const res = await greenFiAxios.post('questionnaire-category', { name: data });
  return res?.data?.data;
};

const editCategory = async (categoryId: any, data: any) => {
  const res = await greenFiAxios.patch(`questionnaire-category/${categoryId}`, {
    name: data
  });
  return res?.data?.data;
};

const deleteCategory = async (categoryId: any) => {
  const res = await greenFiAxios.delete(`questionnaire-category/${categoryId}`);
  return res?.data?.data;
};

const getQuestionCategory = async () => {
  const res = await greenFiAxios.get('category-list');
  return res?.data?.data;
};

const deleteQuestionCategory = async (categoryId: any) => {
  const res = await greenFiAxios.delete(`category-list/${categoryId}`);
  return res?.data?.data;
};

const createQuestionCategory = async (data: any) => {
  const res = await greenFiAxios.post('category-list', { name: data });
  return res?.data?.data;
};

const updateQuestionCategory = async (categoryId: any, data: any) => {
  const res = await greenFiAxios.patch(`category-list/${categoryId}`, {
    name: data
  });
  return res?.data?.data;
};

const assignCategoryToQuestion = async (questionId: number, categoryId: number) => {
  const res = await greenFiAxios.put(`category-list/update-question-category/${categoryId}`, {
    questionId
  });
  return res?.data?.data;
};

const aiAnswerFromDocument = async (formData: any, onProgress?: (progress: number) => void) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = event => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          console.log('Success:', data);
          resolve(data);
        } catch (err) {
          console.error('Parse error:', err);
          reject(err);
        }
      } else {
        console.error('Upload failed:', xhr.responseText);
        reject(new Error(xhr.responseText));
      }
    };

    xhr.onerror = () => {
      console.error('XHR error');
      reject(new Error('Network error'));
    };

    xhr.open('POST', 'https://esgreporting-aianswers.greenfi.ai/auto-answer');
    xhr.send(formData);
  });
};

const API = {
  getListUser,
  getUserInfo,
  patchUserInfo,
  getCompany,
  getCompanyDetail,
  uploadCompany,
  getUploadProcessStatus,
  createCompany,
  editCompany,
  deleteCompany,
  getCountry,
  getCountryFilter,
  getCountryFilterDashboard,
  getIndustryFilter,
  getAsset,
  createBill,
  getAssetMap,
  createAsset,
  createAssetMap,
  deleteAssetMap,
  getQuestionnaire,
  submitAnswer,
  exportQuestionnaire,
  uploadFileApi,
  exportAssetManagement,
  createUser,
  uploadUser,
  exportUser,
  getUserList,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getStatistics,
  getUserGrowth,
  getQuestionnaireApproval,
  getQuestionnaireReview,
  sendQuestionnaireReviewStatus,
  getIndustry,
  getQuestionnaireCategory,
  getQuestionnaireYear,
  getQuestionnaireCategoryUpload,
  getQuestionnaireYearUpload,
  getEditQuestionnaire,
  updateEditQuestionnaire,
  deleteEditQuestionnaire,
  uploadQuestionnaire,
  markFlag,
  sendSupport,
  sendDeviceToken,
  uploadFile,
  getQuestionnaireCategoryStatus,
  deleteDeviceToken,
  getNotifications,
  getNotificationDetail,
  getTotalNotificationUnread,
  sendNotification,
  exportDashboardReport,
  createCategory,
  editCategory,
  deleteCategory,
  getQuestionCategory,
  deleteQuestionCategory,
  createQuestionCategory,
  updateQuestionCategory,
  assignCategoryToQuestion,
  aiAnswerFromDocument
};

export default API;
