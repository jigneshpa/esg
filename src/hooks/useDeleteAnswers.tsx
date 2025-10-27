import { useEffect } from 'react';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppDispatch } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { ErrorData } from '@/types/common';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const useDeleteAnswers = () => {
  const dispatch = useAppDispatch();
  const { confirm, notify } = useAppContext();
  const [deleteAnswerByQuestionId, { isLoading, error, isSuccess, isError }] =
    questionnaireApi.useDeleteAnswerByQuestionIdMutation();

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Answer deleted successfully'
      });
      dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: true }));
    } else if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isSuccess, isError, error, notify, dispatch]);

  const handleDelete = (questionId: number) => {
    confirm({
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        try {
          await deleteAnswerByQuestionId(questionId).unwrap();
          notify({
            type: STATUS.SUCCESS,
            message: 'Answer deleted successfully'
          });
          dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: true }));
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

export default useDeleteAnswers;
