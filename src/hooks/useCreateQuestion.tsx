import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAppContext } from '@/context/AppContext';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { selectUserRole } from '@/store/slices/user/userSelectors';
import { replaceString } from '@/utils';

import { STATUS, URLS } from '../constants';
import useLoadOptions, { ApiType } from './useLoadOptions';

const useCreateQuestion = (handleModal: any, handleIsSubmittingQuestions?: any) => {
  const { qbankId } = useParams();
  const { notify, confirm } = useAppContext();
  const dispatch = useAppDispatch();
  const [createQuestion, { isLoading, isSuccess: isQuestionCreationSuccess, isError, error }] =
    questionnaireApi.useCreateQuestionMutation();
  const [createQuestionnaireBank, { isLoading: isLoadingCreateBank }] =
    questionnaireApi.useCreateQuestionnaireBankMutation();
  const userRole = useAppSelector(selectUserRole);
  const navigate = useNavigate();
  // const loadFrameworkOptions = useLoadOptions(ApiType.Framework);
  const { loadOptions: loadFrameworkOptions } = useLoadOptions(ApiType.Framework);
  const [bankId, setBankId] = useState<string | null>(null);

  useEffect(() => {
    if (isQuestionCreationSuccess) {
      notify({ type: STATUS.SUCCESS, message: 'Question created successfully' });
      dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: true }));
      handleModal();
      if (bankId !== null) dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: true }));
    } else if (isError && error) {
      //@ts-ignore
      notify({ type: STATUS.ERROR, message: 'Kindly ensure that all required fields are completed.' });
    }
  }, [isQuestionCreationSuccess, isError, error, notify, dispatch]);

  const onCreateQuestionBank = async (questions: any[]) => {
    return new Promise((resolve, reject) => {
      createQuestionnaireBank(questions).then(bankData => {
        if ('data' in bankData) {
          let currentQbankId = bankData.data?.data?.id;
          resolve(currentQbankId);
        } else {
          reject(new Error('Invalid bank data'));
        }
      });
    });
  };

  const createQuestionBankAndQuestions = async (questions: any) => {
    if (questions?.length > 0 && !qbankId) {
      onCreateQuestionBank(questions).then(id => {
        questions = questions.map((question: any) => {
          question.question_bank_id = id;
          return question;
        });
        setBankId(id as string | null);
        createQuestion({ questions: questions }).then(() => {
          let redirectUrl = '';
          const mapObj = { ':qbankId': id };
          if (userRole === 'manager') {
            redirectUrl = URLS.MANAGER_QUESTION_BANK;
            redirectUrl = replaceString(URLS.MANAGER_QUESTION_BANK, mapObj);
          } else {
            redirectUrl = URLS.QUESTION_BANK;
            redirectUrl = replaceString(URLS.QUESTION_BANK, mapObj);
          }

          navigate(redirectUrl, { replace: true });
        });
      });
    } else {
      handleIsSubmittingQuestions && handleIsSubmittingQuestions(true);
      await createQuestion({ questions: questions });
    }
  };

  const handleCreateQuestion = (questions: any) => {
    confirm({
      title: 'Save',
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        await createQuestionBankAndQuestions(questions);
        handleIsSubmittingQuestions && handleIsSubmittingQuestions(false);
      }
    });
  };

  return { createQuestion: handleCreateQuestion, isCreating: isLoading };
};

export default useCreateQuestion;
