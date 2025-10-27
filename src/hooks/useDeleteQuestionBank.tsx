import { useEffect } from 'react';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { frameworkApi } from '@/store/api/framework/frameworkApi';
import { ErrorData } from '@/types/common';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';

const useDeleteQuestionBank = () => {
  const { confirm, notify } = useAppContext();
  const [deleteFramework, { isLoading, error, isSuccess, isError }] = questionnaireApi.useDeleteQuestionnaireBankMutation();

  const _deleteFramework = async (id: number) => {
    try {
      await deleteFramework(id);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Question Bank deleted successfully'
      });
    } else if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isSuccess, isError, error, notify]);

  const handleDelete = (id: number) => {
    confirm({
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: () => _deleteFramework(id)
    });
  };

  return { handleDelete, isLoading };
};

export default useDeleteQuestionBank;
