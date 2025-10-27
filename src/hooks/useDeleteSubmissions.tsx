import { useEffect } from 'react';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppDispatch } from '@/store/hooks';
import { ErrorData } from '@/types/common';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const useDeleteSubmissions = () => {
  const dispatch = useAppDispatch();
  const { confirm, notify } = useAppContext();
  const [deleteSubmissions, { isLoading, error, isSuccess, isError }] = questionnaireApi.useDeleteSubmissionsMutation();

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Submission deleted successfully'
      });
    } else if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isSuccess, isError, error, notify, dispatch]);

  const handleDelete = (submissionId: number, userQuestionnaireId?: number) => {
    confirm({
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        try {
          let data: { submissionIds?: number[], userQuestionnaireIds?: number[] } = {}
          if (submissionId) {
            data.submissionIds = [submissionId]
          }
          if (userQuestionnaireId) {
            data.userQuestionnaireIds = [userQuestionnaireId]
          }
          await deleteSubmissions(data).unwrap();
          notify({
            type: STATUS.SUCCESS,
            message: 'Submission deleted successfully'
          });
        } catch (error) {
          notify({
            type: STATUS.ERROR,
            message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
          });
        }
      }
    });
  };

  return { handleDelete, isLoading };
};

export default useDeleteSubmissions;
