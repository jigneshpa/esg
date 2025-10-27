import { useEffect } from 'react';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { userApi } from '@/store/api/user/userApi';
import { useAppDispatch } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';

export const useDeleteQuestionnaireBank = () => {
  //@ts-ignore
  const { confirm, notify } = useAppContext();
  const dispatch = useAppDispatch();
  //const [deleteUser, { isError, error, isSuccess }] = userApi.useDeleteUserMutation();

  const [deleteQuestionnaireBank, { isSuccess, isError, error }] =
    questionnaireApi.useDeleteQuestionnaireBankMutation();

  const _deleteQuestionnaireBank = async (bankId: number) => {
    try {
      await deleteQuestionnaireBank(bankId);
    } catch (e) {
      console.log(e);
    }
  };

  if (isSuccess) {
    dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: true }));
  }

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: MESSAGE.DELETE_QUESTIONNAIRE_BANK_SUCCESS
      });
    } else if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: MESSAGE.DELETE_QUESTIONNAIRE_BANK_FAIL
      });
    }
  }, [isSuccess, isError, error, notify]);

  const handleDeleteQuestionnaireBank = (bankId: number) => {
    confirm({
      type: STATUS.ERROR,
      message: 'Please confirm',
      onOk: () => _deleteQuestionnaireBank(bankId)
    });
  };

  return handleDeleteQuestionnaireBank;
};
