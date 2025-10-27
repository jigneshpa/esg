import { useEffect } from 'react';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppDispatch } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { ErrorData } from '@/types/common';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const useDeleteQuestions = () => {
  const dispatch = useAppDispatch();
  const { confirm, notify } = useAppContext();
  const [deleteQuestions, { isLoading: isQuestionDeleting, error: questionError, isSuccess: isQuestionSuccess, isError: isQuestionError }] = questionnaireApi.useDeleteQuestionsMutation();
  const [deleteAnswerByQuestionId, { isLoading: isAnswerDeleting, error: answerError, isSuccess: isAnswerSuccess, isError: isAnswerError }] = questionnaireApi.useDeleteAnswerByQuestionIdMutation();

  useEffect(() => {
    if (isQuestionSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Question deleted successfully'
      });
      dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: true }));
    } else if (isQuestionError && questionError) {
      notify({
        type: STATUS.ERROR,
        message: ((questionError as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isQuestionSuccess, isQuestionError, questionError, notify, dispatch]);

  useEffect(() => {
    if (isAnswerSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Answer deleted successfully'
      });
    } else if (isAnswerError && answerError) {
      notify({
        type: STATUS.ERROR,
        message: ((answerError as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isAnswerSuccess, isAnswerError, answerError, notify]);

  const handleDelete = (questionId: number, deleteAnswers = false) => {
    confirm({
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        try {
          // Delete answer first if provided
          if (deleteAnswers) {
            await deleteAnswerByQuestionId(questionId).unwrap();
          }

          // Delete question
          await deleteQuestions([questionId]).unwrap();
          notify({
            type: STATUS.SUCCESS,
            message: 'Question deleted successfully'
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

  return { handleDelete, isLoading: isQuestionDeleting || isAnswerDeleting };
};

export default useDeleteQuestions;
