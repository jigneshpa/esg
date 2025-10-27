import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { MESSAGE, STATUS, URLS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { selectUserRole } from '@/store/slices/user/userSelectors';
import { ErrorData } from '@/types/common';
import { replaceString } from '@/utils';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const useUploadQuestionnaire = (handleModal: () => void) => {
  const dispatch = useAppDispatch();
  const { qbankId } = useParams();
  const { confirm, notify } = useAppContext();
  const [_selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadQuestions, { isLoading: isUploading, isSuccess, error }] = questionnaireApi.useUploadQuestionsMutation();
  const userRole = useAppSelector(selectUserRole);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Questionnaire successfully uploaded'
      });
      dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: true }));
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
            uploadQuestions(formData)
              .then(questionsData => {
                if (!qbankId) {
                  let redirectUrl = '';
                  /* @ts-ignore */
                  const bankId = questionsData?.data?.data[0].question_bank_id;
                  /* @ts-ignore */
                  const mapObj = { ':qbankId': bankId };

                  if (bankId) {
                    if (userRole === 'manager') {
                      redirectUrl = URLS.MANAGER_QUESTION_BANK;
                      redirectUrl = replaceString(URLS.MANAGER_QUESTION_BANK, mapObj);
                    } else {
                      redirectUrl = URLS.QUESTION_BANK;
                      redirectUrl = replaceString(URLS.QUESTION_BANK, mapObj);
                    }
                  } else {
                    if (userRole === 'manager') {
                      redirectUrl = URLS.MANAGER_QUESTIONNAIRE;
                    } else {
                      redirectUrl = URLS.ADMIN_QUESTIONNAIRE;
                    }
                  }

                  navigate(redirectUrl, { replace: true });
                } else {
                  handleModal();
                }
              })
              .catch(err => {
                console.log(err);
              });
          } catch (error) {
            console.error(error);
          }
        }
      });
    }
  };

  return { setSelectedFiles, handleExportAndClose, isUploading };
};

export default useUploadQuestionnaire;
