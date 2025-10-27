import { useEffect, useState } from 'react';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { ErrorData } from '@/types/common';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { companyApi } from '../store/api/company/companyApi';

const useUploadCompanies = (handleModal: () => void) => {
  const { confirm, notify } = useAppContext();
  const [_selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [parent_id, setParentId] = useState<any>('');
  const [uploadCompanies, { isLoading: isUploading, isSuccess, error }] = companyApi.useUploadCompaniesMutation();

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: MESSAGE.COMPANIES_UPLOAD_SUCCESS
      });
    } else if (error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isSuccess, error, notify]);

  const handleExportAndClose = async () => {
    if (_selectedFiles && _selectedFiles.length > 0) {
      confirm({
        title: 'Confirm Upload',
        type: STATUS.APPROVED,
        message: 'Please confirm',
        onOk: async () => {
          try {
            const formData = new FormData();

            formData.append('file', _selectedFiles[0]);
            if (parent_id) {
              formData.append('parent_id', parent_id);
            }
            handleModal();
            await uploadCompanies(formData);
          } catch (error) {
            console.error(error);
          }
        }
      });
    }
  };

  return { setSelectedFiles, handleExportAndClose, isUploading, setParentId };
};

export default useUploadCompanies;
