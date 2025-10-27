import { useEffect } from 'react';

import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { MESSAGE, STATUS } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setRefetchQuery } from '../store/slices/refresh/refreshSlice';
import { ErrorData } from '../types/common';
import { selectUserId, selectUserRole } from '@/store/slices/user/userSelectors';

interface UseUpdateAnswerProps {
  questionId: string;
  questionBankId?: string; // [NEW] Added to fetch answers
  setIsEditMode?: (value: boolean) => void;
}

const useUpdateAnswer = ({ questionId, setIsEditMode,questionBankId }: UseUpdateAnswerProps) => {
  const { notify, confirm } = useAppContext();
  const userId = useAppSelector(selectUserId);
  const userRole = useAppSelector(selectUserRole); // [NEW] Get user role
  const dispatch = useAppDispatch();
  const [updateAnswer, { isLoading, isSuccess, error }] = questionnaireApi.useUpdateAnswerMutation();

  



  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Answer successfully updated'
      });
      if (setIsEditMode) {
        setIsEditMode(false);
      }
      dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: true }));
    } else if (error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [notify, dispatch, isSuccess, error, setIsEditMode]);

  const handleUpdateAnswer = (data: any) => {
    confirm({
      title: 'Confirm Update',
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: () => {
        updateAnswer({ data: { question_id: questionId, user_id: userId, ...data } });
      }
    });
  };

  return { updateAnswer: handleUpdateAnswer, isUpdating: isLoading };
};

export default useUpdateAnswer;
